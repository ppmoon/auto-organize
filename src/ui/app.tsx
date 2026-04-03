import React, { useState, useCallback, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { MessageList, type Message } from "./components/MessageList.js";
import { InputBar } from "./components/InputBar.js";
import { StatusBar } from "./components/StatusBar.js";
import type { AIAgent } from "../ai/agent.js";

interface AppProps {
  agent: AIAgent;
  webdavUrl: string;
  model: string;
}

let messageIdCounter = 0;
function nextId(): string {
  return String(++messageIdCounter);
}

export const App: React.FC<AppProps> = ({ agent, webdavUrl, model }) => {

  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: "system",
      content:
        "Welcome to Auto-Organize AI Agent! I can help you manage your 123云盘 files via WebDAV and browse the web. Ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | undefined>();
  const [connected, setConnected] = useState(true);

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: nextId() }]);
  }, []);

  // Set up agent callbacks
  useEffect(() => {
    agent.setCallbacks({
      onToolCall: (toolName, args) => {
        setCurrentTool(toolName);
        addMessage({
          role: "tool",
          content: `Calling ${toolName} with args: ${JSON.stringify(args, null, 2)}`,
          timestamp: new Date(),
          toolName,
        });
      },
      onToolResult: (toolName, result) => {
        setCurrentTool(undefined);
        addMessage({
          role: "tool",
          content: `Result from ${toolName}:\n${result}`,
          timestamp: new Date(),
          toolName,
        });
      },
    });
  }, [agent, addMessage]);

  // Handle Ctrl+L to clear messages
  useInput((_, key) => {
    if (key.ctrl && _.toLowerCase() === "l") {
      setMessages([
        {
          id: nextId(),
          role: "system",
          content: "Conversation cleared.",
          timestamp: new Date(),
        },
      ]);
      agent.clearHistory();
    }
  });

  const handleSubmit = useCallback(
    async (text: string) => {
      addMessage({
        role: "user",
        content: text,
        timestamp: new Date(),
      });

      setIsThinking(true);
      setConnected(true);

      try {
        const response = await agent.chat(text);
        addMessage({
          role: "assistant",
          content: response,
          timestamp: new Date(),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("WebDAV") || msg.includes("ECONNREFUSED")) {
          setConnected(false);
        }
        addMessage({
          role: "error",
          content: `Error: ${msg}`,
          timestamp: new Date(),
        });
      } finally {
        setIsThinking(false);
        setCurrentTool(undefined);
      }
    },
    [agent, addMessage]
  );

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="double" borderColor="cyan" paddingX={1} justifyContent="center">
        <Text bold color="cyan">
          🗂 Auto-Organize AI Agent — 123云盘 WebDAV Manager
        </Text>
      </Box>

      {/* Message area */}
      <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={0} overflow="hidden">
        <MessageList messages={messages} maxLines={30} />
      </Box>

      {/* Status bar */}
      <StatusBar
        webdavUrl={webdavUrl}
        connected={connected}
        model={model}
        isThinking={isThinking}
        currentTool={currentTool}
      />

      {/* Input area */}
      <InputBar
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={isThinking}
        placeholder={
          isThinking ? "Agent is thinking..." : "Type a message and press Enter..."
        }
      />
    </Box>
  );
};
