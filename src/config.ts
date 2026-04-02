import { config } from "dotenv";

config();

export interface AppConfig {
  webdav: {
    url: string;
    username: string;
    password: string;
  };
  openai: {
    apiKey: string;
    baseUrl?: string;
    model: string;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  return {
    webdav: {
      url: requireEnv("WEBDAV_URL"),
      username: requireEnv("WEBDAV_USERNAME"),
      password: requireEnv("WEBDAV_PASSWORD"),
    },
    openai: {
      apiKey: requireEnv("OPENAI_API_KEY"),
      baseUrl: process.env["OPENAI_BASE_URL"],
      model: process.env["OPENAI_MODEL"] ?? "gpt-4o",
    },
  };
}
