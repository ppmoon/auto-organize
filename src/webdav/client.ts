import { createClient, WebDAVClient, FileStat } from "webdav";

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

export class WebDAVService {
  private client: WebDAVClient;

  constructor(config: WebDAVConfig) {
    this.client = createClient(config.url, {
      username: config.username,
      password: config.password,
    });
  }

  async listDirectory(path: string): Promise<FileStat[]> {
    const contents = await this.client.getDirectoryContents(path);
    return contents as FileStat[];
  }

  async readFile(path: string): Promise<string> {
    const content = await this.client.getFileContents(path, {
      format: "text",
    });
    return content as string;
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.client.putFileContents(path, content, { overwrite: true });
  }

  async deleteItem(path: string): Promise<void> {
    await this.client.deleteFile(path);
  }

  async createDirectory(path: string): Promise<void> {
    await this.client.createDirectory(path);
  }

  async moveItem(fromPath: string, toPath: string): Promise<void> {
    await this.client.moveFile(fromPath, toPath);
  }

  async copyItem(fromPath: string, toPath: string): Promise<void> {
    await this.client.copyFile(fromPath, toPath);
  }

  async exists(path: string): Promise<boolean> {
    return this.client.exists(path);
  }

  async getFileInfo(path: string): Promise<FileStat> {
    const stat = await this.client.stat(path);
    if (Array.isArray(stat)) {
      return stat[0] as FileStat;
    }
    return stat as FileStat;
  }
}
