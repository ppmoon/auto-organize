import React from "react";
import { Box, Text } from "ink";

interface StatusBarProps {
  webdavUrl: string;
  connected: boolean;
  model: string;
  isThinking: boolean;
  currentTool?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  webdavUrl,
  connected,
  model,
  isThinking,
  currentTool,
}) => {
  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={2}>
        <Text>
          <Text color={connected ? "green" : "red"}>
            {connected ? "●" : "○"}
          </Text>
          <Text> WebDAV: </Text>
          <Text dimColor>{webdavUrl}</Text>
        </Text>
        <Text>
          <Text color="cyan">🤖 </Text>
          <Text dimColor>{model}</Text>
        </Text>
      </Box>
      <Box>
        {isThinking && (
          <Text color="yellow">
            {currentTool ? `⚙ Using ${currentTool}...` : "⏳ Thinking..."}
          </Text>
        )}
        {!isThinking && (
          <Text dimColor color="gray">
            Press Ctrl+C to exit · Ctrl+L to clear
          </Text>
        )}
      </Box>
    </Box>
  );
};
