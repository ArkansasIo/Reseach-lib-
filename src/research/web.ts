import axios from "axios";
import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { env } from "../config/env.js";
import type { ResearchDocument } from "./types.js";

export async function fetchResearchPage(url: string): Promise<ResearchDocument> {
  const parsedUrl = new URL(url);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only http and https research URLs are supported");
  }

  const response = await axios.get<string>(parsedUrl.toString(), {
    headers: { "User-Agent": env.RESEARCH_USER_AGENT },
    timeout: 30000,
    maxContentLength: 5 * 1024 * 1024
  });

  const $ = cheerio.load(response.data);
  $("script, style, nav, footer, noscript").remove();

  const title = $("title").first().text().trim() || parsedUrl.hostname;
  const content = $("body").text().replace(/\s+/g, " ").trim();
  const abstract = $('meta[name="description"]').attr("content")?.trim();
  const contentHash = createHash("sha256").update(content).digest("hex");

  return {
    sourceType: "web",
    title,
    url: parsedUrl.toString(),
    abstract,
    content,
    metadata: { contentHash, hostname: parsedUrl.hostname }
  };
}
