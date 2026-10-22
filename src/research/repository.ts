import { query } from "../db/mysql.js";
import type { ResearchDocument } from "./types.js";

type IdRow = { id: number };
type InsertResult = { insertId: number; affectedRows: number };

export async function saveDocument(doc: ResearchDocument): Promise<{ id: number; inserted: boolean }> {
  const existing = await query<IdRow[]>(
    `SELECT id FROM research_sources
     WHERE (? IS NOT NULL AND external_id = ?)
        OR (? IS NOT NULL AND url = ?)
     LIMIT 1`,
    [doc.externalId ?? null, doc.externalId ?? null, doc.url ?? null, doc.url ?? null]
  );

  let sourceId: number;
  const inserted = existing.length === 0;
  if (existing.length) {
    sourceId = existing[0]!.id;
    await query(
      `UPDATE research_sources
       SET source_type=?, title=?, url=?, external_id=?, abstract=?, content=?,
           published_at=?, publisher=?, metadata=?
       WHERE id=?`,
      [
        doc.sourceType, doc.title, doc.url ?? null, doc.externalId ?? null,
        doc.abstract ?? null, doc.content ?? null, doc.publishedAt ?? null,
        doc.publisher ?? null, JSON.stringify(doc.metadata ?? {}), sourceId
      ]
    );
  } else {
    const result = await query<InsertResult>(
      `INSERT INTO research_sources
       (source_type,title,url,external_id,publisher,published_at,abstract,content,metadata)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        doc.sourceType, doc.title, doc.url ?? null, doc.externalId ?? null,
        doc.publisher ?? null, doc.publishedAt ?? null, doc.abstract ?? null,
        doc.content ?? null, JSON.stringify(doc.metadata ?? {})
      ]
    );
    sourceId = result.insertId;
  }

  for (const [index, authorName] of (doc.authors ?? []).entries()) {
    const existingAuthor = await query<IdRow[]>(
      "SELECT id FROM authors WHERE name=? LIMIT 1",
      [authorName]
    );
    let authorId: number;
    if (existingAuthor.length) {
      authorId = existingAuthor[0]!.id;
    } else {
      const authorInsert = await query<InsertResult>("INSERT INTO authors(name) VALUES (?)", [authorName]);
      authorId = authorInsert.insertId;
    }
    await query(
      "INSERT IGNORE INTO source_authors(source_id,author_id,author_order) VALUES (?,?,?)",
      [sourceId, authorId, index]
    );
  }

  for (const tagName of doc.tags ?? []) {
    const tagRows = await query<IdRow[]>("SELECT id FROM tags WHERE name=? LIMIT 1", [tagName]);
    let tagId: number;
    if (tagRows.length) {
      tagId = tagRows[0]!.id;
    } else {
      const tagInsert = await query<InsertResult>("INSERT INTO tags(name) VALUES (?)", [tagName]);
      tagId = tagInsert.insertId;
    }
    await query("INSERT IGNORE INTO source_tags(source_id,tag_id) VALUES (?,?)", [sourceId, tagId]);
  }

  return { id: sourceId, inserted };
}
