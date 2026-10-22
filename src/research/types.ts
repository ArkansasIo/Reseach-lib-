export type SourceType =
  | "paper" | "web" | "dataset" | "repository" | "documentation" | "other";

export interface ResearchDocument {
  sourceType: SourceType;
  title: string;
  url?: string;
  externalId?: string;
  publisher?: string;
  publishedAt?: Date;
  abstract?: string;
  content?: string;
  authors?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}
