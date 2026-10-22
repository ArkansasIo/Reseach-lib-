import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  LOG_LEVEL: z.string().default("info"),
  MYSQL_HOST: z.string().default("127.0.0.1"),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_DATABASE: z.string().default("neural_research"),
  MYSQL_USER: z.string().default("research"),
  MYSQL_PASSWORD: z.string().min(1),
  MYSQL_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  ARXIV_QUERY: z.string().default("neural network OR transformer OR deep learning"),
  ARXIV_MAX_RESULTS: z.coerce.number().int().min(1).max(100).default(25),
  RESEARCH_USER_AGENT: z.string().default("NeuralResearchLib/0.1"),
  CRON_RESEARCH: z.string().default("0 */6 * * *"),
  CRON_CLEANUP: z.string().default("30 3 * * *")
});

export const env = envSchema.parse(process.env);
