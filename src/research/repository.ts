import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool, query } from "../db/mysql.js";
import type { ResearchDocument } from "./types.js";

interface IdRow extends RowDataPacket { id: number }
interface InsertResult extends ResultSetHeader { insertId: number }

export async function saveDocument(doc: ResearchDocument): Promise<{ id: number; inserted: boolean }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute<IdRow[]>(
      `SELECT id FROM research_sources
       WHERE (external_id = ? AND ? IS NOT NULL)
          OR (url = ? AND ? IS NOT NULL)
       LIMIT 1 FOR UPDATE`,
      [doc.externalId ?? null, doc.externalId ?? null, doc.url ?? null, doc.url ?? null]
    );

    let sourceId: number;
    const inserted = existing.length === 0;
    if (existing.length > 0) {
      sourceId = existing[0]!.id;
      await connection.execute(
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
      const [result] = await connection.execute<InsertResult>(
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

    for (const [index, rawName] of (doc.authors ?? []).entries()) {
      const authorName = rawName.trim();
      if (!authorName) continue;
      const [authorInsert] = await connection.execute<InsertResult>(
        "INSERT INTO authors(name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
        [authorName]
      );
      const authorId = authorInsert.insertId;
      await connection.execute(
        "INSERT INTO source_authors(source_id,author_id,author_order) VALUES (?,?,?) ON DUPLICATE KEY UPDATE author_order=VALUES(author_order)",
        [sourceId, authorId, index]
      );
    }

    for (const rawTag of doc.tags ?? []) {
      const tagName = rawTag.trim().slice(0, 100);
      if (!tagName) continue;
      const [tagInsert] = await connection.execute<InsertResult>(
        "INSERT INTO tags(name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
        [tagName]
      );
      await connection.execute(
        "INSERT IGNORE INTO source_tags(source_id,tag_id) VALUES (?,?)",
        [sourceId, tagInsert.insertId]
      );
    }

    await connection.commit();
    return { id: sourceId, inserted };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function searchDocuments(term: string, limit = 25): Promise<IdRow[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  return query<IdRow[]>(
    `SELECT id FROM research_sources
     WHERE MATCH(title, abstract, content) AGAINST (? IN NATURAL LANGUAGE MODE)
     ORDER BY published_at DESC
     LIMIT ${safeLimit}`,
    [term]
  );
}
