import type { ChatCompletionTool } from "openai/resources/chat/completions.js";
import type { WebDAVService } from "./client.js";

export const webdavToolDefinitions: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "webdav_list",
      description:
        "List files and directories at the specified WebDAV path on 123云盘",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: 'Directory path to list, e.g. "/" or "/documents"',
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "webdav_read",
      description: "Read the text content of a file from WebDAV",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "File path to read",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "webdav_write",
      description: "Write text content to a file on WebDAV (creates or overwrites)",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "File path to write",
          },
          content: {
            type: "string",
            description: "Text content to write",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "webdav_delete",
      description: "Delete a file or directory from WebDAV",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path of file or directory to delete",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "webdav_mkdir",
      description: "Create a new directory on WebDAV",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Directory path to create",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "webdav_move",
      description: "Move or rename a file or directory on WebDAV",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "Source path",
          },
          to: {
            type: "string",
            description: "Destination path",
          },
        },
        required: ["from", "to"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "webdav_copy",
      description: "Copy a file or directory on WebDAV",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "Source path",
          },
          to: {
            type: "string",
            description: "Destination path",
          },
        },
        required: ["from", "to"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "webdav_info",
      description: "Get metadata/info for a file or directory on WebDAV",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path to inspect",
          },
        },
        required: ["path"],
      },
    },
  },
];

export async function executeWebDAVTool(
  name: string,
  args: Record<string, string>,
  service: WebDAVService
): Promise<string> {
  try {
    switch (name) {
      case "webdav_list": {
        const items = await service.listDirectory(args["path"] ?? "/");
        const formatted = items.map((item) => {
          const type = item.type === "directory" ? "📁" : "📄";
          const size =
            item.type === "file" ? ` (${formatBytes(item.size ?? 0)})` : "";
          return `${type} ${item.basename}${size}`;
        });
        return formatted.length > 0
          ? formatted.join("\n")
          : "(empty directory)";
      }

      case "webdav_read": {
        const content = await service.readFile(args["path"] ?? "");
        return content;
      }

      case "webdav_write": {
        await service.writeFile(args["path"] ?? "", args["content"] ?? "");
        return `File written successfully: ${args["path"]}`;
      }

      case "webdav_delete": {
        await service.deleteItem(args["path"] ?? "");
        return `Deleted successfully: ${args["path"]}`;
      }

      case "webdav_mkdir": {
        await service.createDirectory(args["path"] ?? "");
        return `Directory created: ${args["path"]}`;
      }

      case "webdav_move": {
        await service.moveItem(args["from"] ?? "", args["to"] ?? "");
        return `Moved: ${args["from"]} → ${args["to"]}`;
      }

      case "webdav_copy": {
        await service.copyItem(args["from"] ?? "", args["to"] ?? "");
        return `Copied: ${args["from"]} → ${args["to"]}`;
      }

      case "webdav_info": {
        const info = await service.getFileInfo(args["path"] ?? "");
        return JSON.stringify(
          {
            name: info.basename,
            type: info.type,
            size: info.size != null ? formatBytes(info.size) : "N/A",
            lastModified: info.lastmod,
            path: info.filename,
          },
          null,
          2
        );
      }

      default:
        return `Unknown WebDAV tool: ${name}`;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Error executing ${name}: ${message}`;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
