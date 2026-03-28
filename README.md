# MCP Dashboard - Model Context Protocol Manager

A comprehensive, production-ready Next.js dashboard for managing MCP (Model Context Protocol) servers and tools with LLM integration.

![MCP Dashboard](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)

## 🌟 Features

### Core Functionality
- **🔧 LLM Configuration**: Support for multiple LLM providers (Anthropic Claude, OpenAI GPT, Custom APIs)
- **🖥️ MCP Server Management**: Add, configure, test, and manage multiple MCP servers
- **⚡ Tool Discovery**: Automatically discover and manage tools from connected MCP servers
- **💬 Chat Interface**: Interactive chat with LLM using connected MCP tools
- **📊 Analytics Dashboard**: Real-time token usage tracking and cost estimation
- **💾 Persistent Storage**: Local storage for configurations and chat history
- **📤 Import/Export**: Backup and restore configurations

### Advanced Features
- **Multiple Server Types**: Support for both URL (SSE) and STDIO MCP servers
- **System Prompts**: Customizable system prompts to guide LLM behavior
- **Tool Selection**: Choose which MCP tools to enable
- **Connection Testing**: Test MCP server connectivity before use
- **Token Analytics**: Track input/output tokens and estimated costs
- **Conversation History**: Save and review past interactions
- **Dark Mode**: Beautiful dark mode support
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone or download the project**
```bash
cd mcp-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Initial Setup

1. **Configure Your LLM**
   - On first launch, you'll see the setup screen
   - Select your LLM provider (Anthropic, OpenAI, or Custom)
   - Enter your API URL (e.g., `https://api.anthropic.com/v1/messages`)
   - Provide your API key
   - Specify the model (e.g., `claude-sonnet-4-20250514`)
   - Click "Continue to Dashboard"

### Adding MCP Servers

1. **Navigate to MCP Servers tab**
2. **Fill in server details:**
   - **Name**: A friendly name for your server (e.g., "Gmail MCP")
   - **Type**: Choose URL (SSE) or STDIO
   - **URL/Command**: Server endpoint or command to run
   - **Arguments** (for STDIO): Comma-separated args

3. **Click "Add Server"**
4. **Test Connection**: Click the refresh icon to test connectivity

#### Example MCP Server Configurations

**URL-based Server (Gmail):**
```
Name: Gmail MCP
Type: URL
URL: https://gmail.mcp.claude.com/mcp
```

**STDIO-based Server:**
```
Name: Local MCP Server
Type: STDIO
Command: npx
Arguments: -y, @modelcontextprotocol/server-filesystem, /path/to/directory
```

### Using the Chat Interface

1. **Navigate to Chat Interface tab**
2. **Configure System Prompt** (right panel):
   - Customize how the LLM behaves
   - Default prompt guides tool usage
   - Click "Save Prompt" to persist

3. **Start Chatting**:
   - Type your message in the input box
   - Press Enter or click Send
   - LLM will use connected MCP tools automatically
   - Tool usage is displayed with each response

### Monitoring Analytics

1. **Navigate to Analytics tab**
2. **View metrics:**
   - Total tokens used
   - Input/Output token breakdown
   - Estimated costs
   - Server status
   - Conversation statistics

### Managing Configuration

**Export Configuration:**
- Click the Download icon in the header
- Saves your servers and settings (API key excluded)

**Import Configuration:**
- Click the Upload icon in the header
- Select a previously exported JSON file
- Configuration will be restored

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Storage**: Browser LocalStorage

### Project Structure
```
mcp-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard component
│   └── globals.css         # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

### State Management

The application uses React hooks for state management:
- `llmConfig`: LLM provider configuration
- `mcpServers`: List of configured MCP servers
- `mcpTools`: Discovered tools from servers
- `messages`: Chat conversation history
- `tokenUsage`: Token consumption analytics

### Data Persistence

All data is stored in browser LocalStorage:
- `llmConfig`: LLM configuration (API key is encrypted)
- `mcpServers`: Server configurations
- `chatMessages`: Conversation history
- `tokenUsage`: Token analytics
- `systemPrompt`: Custom system prompt

## 🔐 Security

- **API Keys**: Stored locally, never sent to third parties
- **HTTPS Only**: Always use HTTPS endpoints
- **No Backend**: All processing happens client-side
- **Local Storage**: Data stays in your browser

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js` and `globals.css` to customize the color scheme:

```css
/* globals.css */
:root {
  --primary: 262 83% 58%;  /* Purple */
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### Adding New Features

The codebase is modular and easy to extend:
- Add new tabs by modifying the `activeTab` state
- Create new server types by extending the `MCPServer` interface
- Add analytics widgets in the Analytics tab

## 📊 Token Pricing

Current pricing estimates (configurable in code):
- **Claude Sonnet**: $3/M input tokens, $15/M output tokens
- Adjust in the `calculateCost()` function

## 🐛 Troubleshooting

### Server Connection Fails
- Verify the server URL is correct
- Check server is running and accessible
- Ensure CORS is configured on the server

### Chat Not Working
- Verify API key is correct
- Check API URL matches your provider
- Ensure connected servers are active

### Tools Not Appearing
- Test server connection first
- Verify server implements MCP protocol correctly
- Check browser console for errors

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload the .next folder to Netlify
```

## 🤝 Contributing

This is a complete, self-contained project. To modify:
1. Fork or copy the code
2. Make your changes
3. Test thoroughly
4. Deploy your version

## 📝 License

MIT License - feel free to use this in your projects!

## 🙏 Acknowledgments

- Built with Next.js and React
- Designed with Tailwind CSS
- Icons by Lucide
- Model Context Protocol by Anthropic

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Consult MCP documentation at Anthropic

---

**Built with ❤️ for the MCP community**
