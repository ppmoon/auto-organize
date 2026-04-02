import React from "react";
import { Box, Text, useInput } from "ink";

interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const InputBar: React.FC<InputBarProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  useInput(
    (input, key) => {
      if (disabled) return;

      if (key.return) {
        const trimmed = value.trim();
        if (trimmed) {
          onSubmit(trimmed);
          onChange("");
        }
        return;
      }

      if (key.backspace || key.delete) {
        onChange(value.slice(0, -1));
        return;
      }

      // Only accept printable characters
      if (!key.ctrl && !key.meta && input && input.length > 0) {
        onChange(value + input);
      }
    },
    { isActive: !disabled }
  );

  const displayText = value || placeholder;
  const isPlaceholder = !value;

  return (
    <Box borderStyle="single" borderColor={disabled ? "gray" : "cyan"} paddingX={1}>
      <Text color="cyan" bold>
        ❯{" "}
      </Text>
      <Text dimColor={isPlaceholder} color={disabled ? "gray" : undefined}>
        {displayText}
        {!disabled && <Text color="cyan">█</Text>}
      </Text>
    </Box>
  );
};
