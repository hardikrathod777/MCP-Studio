import { spawn } from 'node:child_process';

import { NextResponse } from 'next/server';

type ServerType = 'url' | 'stdio';

interface DiscoverServerPayload {
  id: string;
  name: string;
  url: string;
  type: ServerType;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: unknown };
}

interface DiscoveredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverId: string;
}

const MCP_PROTOCOL_VERSION = '2024-11-05';
const REQUEST_TIMEOUT_MS = 15000;
const SSE_EVENT_BOUNDARY = /\r?\n\r?\n/;

function timeoutError(operation: string) {
  return new Error(`${operation} timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
}

function isDeployedRuntime(requestUrl: string) {
  const hostname = new URL(requestUrl).hostname;
  return process.env.VERCEL === '1' || hostname !== 'localhost';
}

function isLoopbackOrPrivateHost(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  if (normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1') {
    return true;
  }

  if (/^127\.\d+\.\d+\.\d+$/.test(normalized)) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(normalized)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(normalized)) return true;

  const match172 = normalized.match(/^172\.(\d+)\.\d+\.\d+$/);
  if (match172) {
    const secondOctet = Number(match172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  return false;
}

async function discoverTools(server: DiscoverServerPayload): Promise<DiscoveredTool[]> {
  if (server.type === 'stdio') {
    return discoverToolsOverStdio(server);
  }

  return discoverToolsOverUrl(server);
}

async function discoverToolsOverStdio(server: DiscoverServerPayload): Promise<DiscoveredTool[]> {
  const command = server.command || server.url;
  if (!command) {
    throw new Error('Missing STDIO command');
  }

  const child = spawn(command, server.args ?? [], {
    env: { ...process.env, ...(server.env ?? {}) },
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  const cleanup = async () => {
    if (!child.killed) {
      child.kill();
    }

    await new Promise(resolve => setTimeout(resolve, 50));
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  };

  try {
    const send = (message: JsonRpcMessage) => {
      child.stdin.write(`${JSON.stringify(message)}\n`);
    };

    const stderrChunks: string[] = [];
    child.stderr.on('data', chunk => {
      stderrChunks.push(chunk.toString());
    });

    const readResponse = (requestId: number, operation: string) =>
      new Promise<JsonRpcMessage>((resolve, reject) => {
        let buffer = '';

        const onData = (chunk: Buffer | string) => {
          buffer += chunk.toString();
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
              const parsed = JSON.parse(trimmed) as JsonRpcMessage;
              if (parsed.id !== requestId) continue;
              cleanupListeners();
              if (parsed.error) {
                reject(new Error(parsed.error.message));
                return;
              }
              resolve(parsed);
              return;
            } catch {
              // Ignore non-JSON log lines written to stdout by buggy servers.
            }
          }
        };

        const onExit = () => {
          cleanupListeners();
          const stderr = stderrChunks.join('\n').trim();
          reject(new Error(stderr || `${operation} failed because the MCP process exited early.`));
        };

        const timer = setTimeout(() => {
          cleanupListeners();
          reject(timeoutError(operation));
        }, REQUEST_TIMEOUT_MS);

        const cleanupListeners = () => {
          clearTimeout(timer);
          child.stdout.off('data', onData);
          child.off('exit', onExit);
          child.off('error', onExit);
        };

        child.stdout.on('data', onData);
        child.once('exit', onExit);
        child.once('error', onExit);
      });

    send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'mcp-dashboard', version: '1.0.0' },
      },
    });
    await readResponse(1, 'MCP initialize');

    send({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {},
    });

    send({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    });

    const toolsResponse = await readResponse(2, 'MCP tools/list');
    const rawTools = Array.isArray(toolsResponse.result?.tools) ? toolsResponse.result?.tools : [];

    return rawTools.map(tool => {
      const typedTool = tool as { name?: string; description?: string; inputSchema?: Record<string, unknown> };
      return {
        name: typedTool.name ?? 'unnamed_tool',
        description: typedTool.description ?? 'No description provided',
        inputSchema: typedTool.inputSchema ?? {},
        serverId: server.id,
      };
    });
  } finally {
    await cleanup();
  }
}

async function discoverToolsOverUrl(server: DiscoverServerPayload): Promise<DiscoveredTool[]> {
  const url = new URL(server.url);
  const attempts: string[] = [];

  const candidates = buildHttpCandidates(url);
  for (const candidate of candidates) {
    try {
      return await discoverToolsOverStreamableHttp(server, candidate);
    } catch (error) {
      attempts.push(`${candidate} -> ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  try {
    return await discoverToolsOverSse(server, url);
  } catch (error) {
    attempts.push(`${url.toString()} (legacy SSE) -> ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  throw new Error(`Unable to discover tools. Attempts: ${attempts.join(' | ')}`);
}

function buildHttpCandidates(url: URL): string[] {
  const candidates = new Set<string>([url.toString()]);

  if (url.pathname.endsWith('/sse')) {
    const siblingMessages = new URL(url.toString());
    siblingMessages.pathname = siblingMessages.pathname.replace(/\/sse$/, '/messages');
    candidates.add(siblingMessages.toString());

    const siblingMessage = new URL(url.toString());
    siblingMessage.pathname = siblingMessage.pathname.replace(/\/sse$/, '/message');
    candidates.add(siblingMessage.toString());
  }

  return [...candidates];
}

async function discoverToolsOverStreamableHttp(server: DiscoverServerPayload, endpoint: string): Promise<DiscoveredTool[]> {
  let sessionId: string | null = null;

  const sendRequest = async (message: JsonRpcMessage): Promise<JsonRpcMessage | null> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };

    if (sessionId) {
      headers['Mcp-Session-Id'] = sessionId;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while calling ${message.method}`);
    }

    sessionId = response.headers.get('Mcp-Session-Id') ?? sessionId;
    const isNotification = message.id == null;
    if (response.status === 202 || response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/event-stream')) {
      return parseSseJsonRpc(await response.text(), message.id);
    }

    const bodyText = await response.text();
    if (!bodyText.trim()) {
      if (isNotification) {
        return null;
      }
      throw new Error(`Empty response body while calling ${message.method}`);
    }

    return JSON.parse(bodyText) as JsonRpcMessage;
  };

  const initResponse = await sendRequest({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'mcp-dashboard', version: '1.0.0' },
    },
  });

  if (!initResponse) {
    throw new Error('No response received for initialize');
  }

  if (initResponse.error) {
    throw new Error(initResponse.error.message);
  }

  await sendRequest({
    jsonrpc: '2.0',
    method: 'notifications/initialized',
    params: {},
  });

  const toolsResponse = await sendRequest({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  });

  if (!toolsResponse) {
    throw new Error('No response received for tools/list');
  }

  if (toolsResponse.error) {
    throw new Error(toolsResponse.error.message);
  }

  const rawTools = Array.isArray(toolsResponse.result?.tools) ? toolsResponse.result.tools : [];
  return rawTools.map(tool => {
    const typedTool = tool as { name?: string; description?: string; inputSchema?: Record<string, unknown> };
    return {
      name: typedTool.name ?? 'unnamed_tool',
      description: typedTool.description ?? 'No description provided',
      inputSchema: typedTool.inputSchema ?? {},
      serverId: server.id,
    };
  });
}

async function discoverToolsOverSse(server: DiscoverServerPayload, sseUrl: URL): Promise<DiscoveredTool[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(timeoutError('Opening SSE transport')), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(sseUrl, {
      method: 'GET',
      headers: { Accept: 'text/event-stream' },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while opening SSE transport`);
    }

    const endpointPath = await readSseEndpoint(response);
    if (!endpointPath) {
      throw new Error('The SSE server did not provide an MCP message endpoint.');
    }

    const endpoint = new URL(endpointPath, sseUrl).toString();
    return discoverToolsOverStreamableHttp(server, endpoint);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

async function readSseEndpoint(response: Response): Promise<string | null> {
  if (!response.body) {
    throw new Error('The SSE response did not include a readable body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    const events = buffer.split(SSE_EVENT_BOUNDARY);
    buffer = events.pop() ?? '';

    for (const eventBlock of events) {
      const endpoint = extractSseEndpoint(eventBlock);
      if (endpoint) {
        return endpoint;
      }
    }

    if (done) {
      return extractSseEndpoint(buffer);
    }
  }
}

function extractSseEndpoint(eventBlock: string): string | null {
  const lines = eventBlock.split(/\r?\n/);
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (eventName === 'endpoint' && dataLines.length > 0) {
    return dataLines.join('\n');
  }

  return null;
}

function parseSseJsonRpc(rawSse: string, requestId?: number): JsonRpcMessage {
  const events = rawSse.split(SSE_EVENT_BOUNDARY);

  for (const eventBlock of events) {
    const dataLines = eventBlock
      .split(/\r?\n/)
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trim());

    if (dataLines.length === 0) continue;

    try {
      const parsed = JSON.parse(dataLines.join('\n')) as JsonRpcMessage;
      if (requestId == null || parsed.id === requestId) {
        return parsed;
      }
    } catch {
      // Ignore malformed SSE payloads and continue scanning.
    }
  }

  throw new Error('No JSON-RPC response found in SSE payload.');
}

export async function POST(request: Request) {
  try {
    const server = await request.json() as DiscoverServerPayload;
    const deployed = isDeployedRuntime(request.url);

    if (server.type === 'stdio' && deployed) {
      return NextResponse.json(
        {
          error: 'STDIO MCP servers cannot be reached from a deployed Vercel site. Use local development or a local companion/relay process.',
        },
        { status: 400 },
      );
    }

    if (server.type === 'url') {
      const hostname = new URL(server.url).hostname;
      if (deployed && isLoopbackOrPrivateHost(hostname)) {
        return NextResponse.json(
          {
            error: `This deployed site cannot reach ${hostname}. From Vercel, localhost/private IP addresses refer to the serverless runtime, not your computer. Expose the MCP server on a public HTTPS URL or use a local desktop/relay app.`,
          },
          { status: 400 },
        );
      }
    }

    const tools = await discoverTools(server);
    return NextResponse.json({ tools });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to discover tools';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
