# Neural Research Library

A TypeScript research service for collecting, cataloging, and analyzing AI and neural-network research, backed by MySQL.

## Stack
- Node.js + TypeScript (ES modules)
- MySQL 8.4 / mysql2
- arXiv API ingestion
- Cron scheduling with node-cron
- Zod configuration validation
- Pino structured logging
- Web-page metadata/content ingestion foundation
- Research catalog, models, datasets, experiments, metrics, authors, tags, and run history

## Quick start
1. Install Node.js 20 or newer and Docker.
2. Copy `.env.example` to `.env` and change the database password.
3. Start MySQL: `docker compose up -d mysql`
4. Install dependencies: `npm install`
5. Initialize the schema: `npm run db:migrate`
6. Run one ingestion cycle: `npm run research`
7. Run scheduled ingestion: `npm run jobs`

## Available commands
- `npm run build` — compile TypeScript into `dist/`
- `npm run research` — ingest the configured arXiv query once
- `npm run jobs` — schedule research and cleanup jobs
- `npm run db:migrate` — apply the SQL schema

## Configuration
See `.env.example` for MySQL, arXiv search, request user-agent, logging, and cron settings.

## Research lifecycle
`discover -> normalize -> deduplicate -> store -> tag -> analyze -> experiment -> observe`

The project separates literature ingestion and catalog storage from model-training execution. Training workers can later use Python/PyTorch, TensorFlow, ONNX Runtime, or a remote compute service.

## Important limitations
This starter stores research material and experiment metadata; it is not a trained AI research agent by itself. Model summaries, generated hypotheses, and experiment results should be treated as unverified until validated against source papers and reproducible runs. Respect source terms, robots policies, API rate limits, and licensing.
