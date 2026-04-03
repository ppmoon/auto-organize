import React from "react";
import { Box, Text } from "ink";

export interface Message {
  id: string;
  role: "user" | "assistant" | "tool" | "system" | "error";
  content: string;
  timestamp: Date;
  toolName?: string;
}

interface MessageListProps {
  messages: Message[];
  maxLines?: number;
}

function roleColor(
  role: Message["role"]
): "green" | "cyan" | "yellow" | "gray" | "red" {
  switch (role) {
    case "user":
      return "green";
    case "assistant":
      return "cyan";
    case "tool":
      return "yellow";
    case "error":
      return "red";
    default:
      return "gray";
  }
}

function roleLabel(role: Message["role"], toolName?: string): string {
  switch (role) {
    case "user":
      return "You";
    case "assistant":
      return "Agent";
    case "tool":
      return `Tool[${toolName ?? "unknown"}]`;
    case "system":
      return "System";
    case "error":
      return "Error";
  }
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  maxLines = 20,
}) => {
  const visible = messages.slice(-maxLines);

  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      {visible.map((msg) => (
        <Box key={msg.id} flexDirection="column" marginBottom={0}>
          <Box>
            <Text color={roleColor(msg.role)} bold>
              [{roleLabel(msg.role, msg.toolName)}]
            </Text>
            <Text dimColor>
              {" "}
              {msg.timestamp.toLocaleTimeString()}
            </Text>
          </Box>
          <Box paddingLeft={2}>
            <Text wrap="wrap">{msg.content}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
