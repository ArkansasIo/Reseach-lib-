import { logger } from "../config/logger.js";
import { query } from "../db/mysql.js";
import { searchArxiv } from "../research/arxiv.js";
import { saveDocument } from "../research/repository.js";

type InsertResult = { insertId: number };

export async function runResearchJob(): Promise<void> {
  const start = await query<InsertResult>(
    "INSERT INTO research_runs(job_name,status,started_at) VALUES ('arxiv-ingest','running',NOW())"
  );
  const runId = start.insertId;

  try {
    const documents = await searchArxiv();
    let inserted = 0;
    for (const document of documents) {
      const result = await saveDocument(document);
      if (result.inserted) inserted += 1;
    }

    await query(
      `UPDATE research_runs
       SET status='success', finished_at=NOW(), records_found=?, records_created=?
       WHERE id=?`,
      [documents.length, inserted, runId]
    );
    logger.info({ runId, found: documents.length, inserted }, "Research ingestion completed");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await query(
      "UPDATE research_runs SET status='failed', finished_at=NOW(), error_message=? WHERE id=?",
      [message.slice(0, 60000), runId]
    );
    logger.error({ runId, error: message }, "Research ingestion failed");
    throw error;
  }
}
