import puppeteer, { Browser, Page } from "puppeteer";

export class BrowserService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });
  }

  async navigate(url: string): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    await this.page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    return this.page.url();
  }

  async getPageText(): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    const text = await this.page.evaluate(() => document.body.innerText);
    // Trim excessive whitespace
    return text.replace(/\s{3,}/g, "\n\n").trim().slice(0, 8000);
  }

  async getPageTitle(): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    return this.page.url();
  }

  async search(query: string): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    const encoded = encodeURIComponent(query);
    await this.page.goto(`https://www.bing.com/search?q=${encoded}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Extract search results
    const results = await this.page.evaluate(() => {
      const items = document.querySelectorAll(".b_algo");
      const extracted: Array<{ title: string; url: string; snippet: string }> =
        [];
      items.forEach((item, idx) => {
        if (idx >= 5) return;
        const titleEl = item.querySelector("h2 a");
        const snippetEl = item.querySelector(".b_caption p");
        extracted.push({
          title: titleEl?.textContent?.trim() ?? "",
          url: (titleEl as HTMLAnchorElement)?.href ?? "",
          snippet: snippetEl?.textContent?.trim() ?? "",
        });
      });
      return extracted;
    });

    if (results.length === 0) {
      return await this.getPageText();
    }

    return results
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.snippet}`
      )
      .join("\n\n");
  }

  async clickElement(selector: string): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    await this.page.click(selector);
    await this.page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
    return `Clicked element: ${selector}`;
  }

  async typeInElement(selector: string, text: string): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    await this.page.type(selector, text);
    return `Typed text into: ${selector}`;
  }

  async extractLinks(): Promise<string> {
    if (!this.page) throw new Error("Browser not initialized");
    const links = await this.page.evaluate(() => {
      const anchors = document.querySelectorAll("a[href]");
      const result: Array<{ text: string; href: string }> = [];
      anchors.forEach((a, idx) => {
        if (idx >= 20) return;
        const href = (a as HTMLAnchorElement).href;
        if (href.startsWith("http")) {
          result.push({ text: a.textContent?.trim() ?? "", href });
        }
      });
      return result;
    });
    return links.map((l) => `${l.text || "(no text)"}: ${l.href}`).join("\n");
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}
