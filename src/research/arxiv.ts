import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { env } from "../config/env.js";
import type { ResearchDocument } from "./types.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  isArray: (name) => ["entry", "author", "category"].includes(name)
});

function oneOrMany<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export async function searchArxiv(): Promise<ResearchDocument[]> {
  const url =
    "https://export.arxiv.org/api/query" +
    `?search_query=all:${encodeURIComponent(env.ARXIV_QUERY)}` +
    `&start=0&max_results=${env.ARXIV_MAX_RESULTS}&sortBy=submittedDate&sortOrder=descending`;

  const response = await axios.get<string>(url, {
    headers: { "User-Agent": env.RESEARCH_USER_AGENT },
    timeout: 30000
  });
  const parsed = parser.parse(response.data);
  const entries = oneOrMany<any>(parsed?.feed?.entry);

  return entries.map((entry) => {
    const idUrl = String(entry.id ?? "").trim();
    return {
      sourceType: "paper",
      title: String(entry.title ?? "").replace(/\s+/g, " ").trim(),
      url: idUrl || undefined,
      externalId: idUrl.split("/").pop()?.replace(/v\d+$/, "") || undefined,
      publisher: "arXiv",
      publishedAt: entry.published ? new Date(String(entry.published)) : undefined,
      abstract: String(entry.summary ?? "").replace(/\s+/g, " ").trim(),
      authors: oneOrMany<any>(entry.author).map((author) => String(author.name ?? "").trim()).filter(Boolean),
      tags: oneOrMany<any>(entry.category).map((category) => String(category["@_term"] ?? category.term ?? "").trim()).filter(Boolean),
      metadata: {
        categories: oneOrMany<any>(entry.category).map((category) => category["@_term"] ?? category.term).filter(Boolean),
        updated: entry.updated ?? null
      }
    } satisfies ResearchDocument;
  }).filter((doc) => doc.title.length > 0 && Boolean(doc.url));
}
