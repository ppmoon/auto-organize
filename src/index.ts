#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import { loadConfig } from "./config.js";
import { WebDAVService } from "./webdav/client.js";
import { BrowserService } from "./browser/client.js";
import { AIAgent } from "./ai/agent.js";
import { App } from "./ui/app.js";

async function main(): Promise<void> {
  // Load configuration from environment variables
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Configuration error: ${msg}`);
    console.error("\nPlease create a .env file with the following variables:");
    console.error("  WEBDAV_URL=https://webdav.123pan.com");
    console.error("  WEBDAV_USERNAME=your_username");
    console.error("  WEBDAV_PASSWORD=your_password");
    console.error("  OPENAI_API_KEY=your_openai_api_key");
    console.error(
      "  OPENAI_BASE_URL=https://api.openai.com/v1  # optional"
    );
    console.error("  OPENAI_MODEL=gpt-4o                    # optional");
    process.exit(1);
  }

  // Initialize services
  const webdavService = new WebDAVService(config.webdav);
  const browserService = new BrowserService();

  // Initialize browser
  try {
    await browserService.initialize();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Warning: Browser initialization failed: ${msg}`);
    console.error("Browser tools will not be available.");
  }

  // Initialize AI agent
  const agent = new AIAgent(config.openai, webdavService, browserService);

  // Render the terminal UI
  const { waitUntilExit } = render(
    React.createElement(App, {
      agent,
      webdavUrl: config.webdav.url,
      model: config.openai.model,
    })
  );

  // Wait for the app to exit (Ctrl+C)
  await waitUntilExit();

  // Cleanup
  await browserService.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
