# auto-organize

An AI agent program written in TypeScript that:

1. **WebDAV Access** — Connects to 123云盘 (123 Cloud Storage) via WebDAV protocol
2. **AI Agent** — Uses OpenAI GPT to intelligently operate WebDAV (list, read, write, delete, move files)
3. **Browser Automation** — The AI agent can browse the web via Puppeteer to gather information
4. **Terminal UI** — An interactive TUI (Terminal User Interface) built with Ink/React for human–AI communication

## Architecture

```
src/
├── index.ts              # Entry point
├── config.ts             # Configuration loader (.env)
├── webdav/
│   ├── client.ts         # WebDAV service wrapper (123云盘)
│   └── tools.ts          # WebDAV tool definitions for the AI agent
├── browser/
│   ├── client.ts         # Puppeteer browser automation service
│   └── tools.ts          # Browser tool definitions for the AI agent
├── ai/
│   └── agent.ts          # AI agent with OpenAI tool-calling loop
└── ui/
    ├── app.tsx            # Main terminal UI component
    └── components/
        ├── MessageList.tsx # Chat message history
        ├── InputBar.tsx    # Text input field
        └── StatusBar.tsx   # Status bar (connection, model, thinking)
```

## Requirements

- Node.js 18+
- npm
- An OpenAI API key (or compatible provider)
- A 123云盘 account with WebDAV enabled

## Setup

1. **Clone the repository and install dependencies:**

   ```bash
   npm install
   ```

2. **Create a `.env` file** (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   ```env
   WEBDAV_URL=https://webdav.123pan.com
   WEBDAV_USERNAME=your_123pan_username
   WEBDAV_PASSWORD=your_123pan_password
   OPENAI_API_KEY=your_openai_api_key
   # Optional:
   # OPENAI_BASE_URL=https://api.openai.com/v1
   # OPENAI_MODEL=gpt-4o
   ```

3. **Build:**

   ```bash
   npm run build
   ```

4. **Run:**

   ```bash
   npm start
   ```

## Available AI Tools

### WebDAV Tools (123云盘)

| Tool | Description |
|------|-------------|
| `webdav_list` | List files and directories at a path |
| `webdav_read` | Read text content of a file |
| `webdav_write` | Write text content to a file |
| `webdav_delete` | Delete a file or directory |
| `webdav_mkdir` | Create a new directory |
| `webdav_move` | Move or rename a file/directory |
| `webdav_copy` | Copy a file/directory |
| `webdav_info` | Get metadata about a file/directory |

### Browser Tools

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_search` | Search the web via Bing |
| `browser_get_text` | Get visible text of current page |
| `browser_get_title` | Get page title |
| `browser_get_url` | Get current URL |
| `browser_extract_links` | Extract all links from current page |
| `browser_click` | Click an element by CSS selector |
| `browser_type` | Type text into an input element |

## Usage Examples

Once the TUI is running, you can chat with the agent:

- `"List all files in my root directory"`
- `"Create a folder called 'Projects' and move all .txt files into it"`
- `"Search for information about TypeScript best practices and save a summary to /notes/typescript.md"`
- `"What's the largest file in my cloud storage?"`
- `"Download the content of /documents/report.txt and summarize it"`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Ctrl+C` | Exit the application |
| `Ctrl+L` | Clear conversation history |

## Development

```bash
# Type-check without building
npm run typecheck

# Build
npm run build
```
