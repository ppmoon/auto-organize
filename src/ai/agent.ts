import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageFunctionToolCall,
} from "openai/resources/chat/completions.js";
import type { WebDAVService } from "../webdav/client.js";
import type { BrowserService } from "../browser/client.js";
import {
  webdavToolDefinitions,
  executeWebDAVTool,
} from "../webdav/tools.js";
import {
  browserToolDefinitions,
  executeBrowserTool,
} from "../browser/tools.js";

export interface AgentConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export type MessageRole = "user" | "assistant" | "tool" | "system";

export interface ConversationMessage {
  role: MessageRole;
  content: string;
  toolName?: string;
  timestamp: Date;
}

export type OnMessageCallback = (message: ConversationMessage) => void;
export type OnToolCallCallback = (
  toolName: string,
  args: Record<string, unknown>
) => void;
export type OnToolResultCallback = (toolName: string, result: string) => void;

export class AIAgent {
  private openai: OpenAI;
  private model: string;
  private history: ChatCompletionMessageParam[] = [];
  private onMessage?: OnMessageCallback;
  private onToolCall?: OnToolCallCallback;
  private onToolResult?: OnToolResultCallback;

  constructor(
    config: AgentConfig,
    private webdavService: WebDAVService,
    private browserService: BrowserService
  ) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
    });
    this.model = config.model;

    // System message
    this.history.push({
      role: "system",
      content: `You are an intelligent AI assistant with access to 123云盘 (123 Cloud Storage) via WebDAV and a web browser.

You can help users:
- Manage their cloud storage: list, read, write, delete, move, copy files and directories
- Search the web and browse websites to gather information
- Organize files intelligently based on content or naming patterns

When using tools:
- Always confirm destructive operations (delete, overwrite) by explaining what you are about to do
- Provide clear feedback after each operation
- If an operation fails, explain the error and suggest alternatives

Current date: ${new Date().toISOString().split("T")[0]}`,
    });
  }

  setCallbacks(callbacks: {
    onMessage?: OnMessageCallback;
    onToolCall?: OnToolCallCallback;
    onToolResult?: OnToolResultCallback;
  }): void {
    this.onMessage = callbacks.onMessage;
    this.onToolCall = callbacks.onToolCall;
    this.onToolResult = callbacks.onToolResult;
  }

  async chat(userMessage: string): Promise<string> {
    this.history.push({ role: "user", content: userMessage });

    const allTools = [...webdavToolDefinitions, ...browserToolDefinitions];

    let response = await this.openai.chat.completions.create({
      model: this.model,
      messages: this.history,
      tools: allTools,
      tool_choice: "auto",
    });

    // Agentic loop: keep processing tool calls until the model responds without tools
    while (response.choices[0]?.finish_reason === "tool_calls") {
      const assistantMessage = response.choices[0].message;
      this.history.push(assistantMessage);

      const toolCalls = (assistantMessage.tool_calls ?? []).filter(
        (tc): tc is ChatCompletionMessageFunctionToolCall => tc.type === "function"
      );

      // Process all tool calls sequentially (safer for shared state)
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments) as Record<
            string,
            unknown
          >;
        } catch {
          args = {};
        }

        this.onToolCall?.(toolName, args);

        let result: string;
        if (toolName.startsWith("webdav_")) {
          result = await executeWebDAVTool(
            toolName,
            args as Record<string, string>,
            this.webdavService
          );
        } else if (toolName.startsWith("browser_")) {
          result = await executeBrowserTool(
            toolName,
            args as Record<string, string>,
            this.browserService
          );
        } else {
          result = `Unknown tool: ${toolName}`;
        }

        this.onToolResult?.(toolName, result);

        // Each tool call needs its own tool result message
        this.history.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      response = await this.openai.chat.completions.create({
        model: this.model,
        messages: this.history,
        tools: allTools,
        tool_choice: "auto",
      });
    }

    const finalContent =
      response.choices[0]?.message?.content ?? "(no response)";
    this.history.push({ role: "assistant", content: finalContent });

    this.onMessage?.({
      role: "assistant",
      content: finalContent,
      timestamp: new Date(),
    });

    return finalContent;
  }

  clearHistory(): void {
    // Keep only the system message
    this.history = this.history.slice(0, 1);
  }

  getHistory(): ChatCompletionMessageParam[] {
    return [...this.history];
  }
}
