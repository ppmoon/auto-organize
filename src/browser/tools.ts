import type { ChatCompletionTool } from "openai/resources/chat/completions.js";
import type { BrowserService } from "./client.js";

export const browserToolDefinitions: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "browser_navigate",
      description: "Navigate the browser to a specific URL",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to navigate to",
          },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_search",
      description: "Search the web using Bing and return top results",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_get_text",
      description:
        "Get the visible text content of the current browser page",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_get_title",
      description: "Get the title of the current browser page",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_get_url",
      description: "Get the current URL in the browser",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_extract_links",
      description: "Extract all hyperlinks from the current page",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_click",
      description: "Click an element on the current page by CSS selector",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector of the element to click",
          },
        },
        required: ["selector"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_type",
      description:
        "Type text into an element on the current page by CSS selector",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector of the input element",
          },
          text: {
            type: "string",
            description: "Text to type",
          },
        },
        required: ["selector", "text"],
      },
    },
  },
];

export async function executeBrowserTool(
  name: string,
  args: Record<string, string>,
  service: BrowserService
): Promise<string> {
  try {
    switch (name) {
      case "browser_navigate": {
        const url = await service.navigate(args["url"] ?? "");
        return `Navigated to: ${url}`;
      }

      case "browser_search": {
        const results = await service.search(args["query"] ?? "");
        return results;
      }

      case "browser_get_text": {
        return service.getPageText();
      }

      case "browser_get_title": {
        return service.getPageTitle();
      }

      case "browser_get_url": {
        return service.getCurrentUrl();
      }

      case "browser_extract_links": {
        return service.extractLinks();
      }

      case "browser_click": {
        return service.clickElement(args["selector"] ?? "");
      }

      case "browser_type": {
        return service.typeInElement(
          args["selector"] ?? "",
          args["text"] ?? ""
        );
      }

      default:
        return `Unknown browser tool: ${name}`;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Error executing ${name}: ${message}`;
  }
}
