# Development Roadmap

## Phase 1 — Research catalog
- MySQL schema for sources, authors, tags, models, datasets, experiments, metrics, and job runs.
- arXiv ingestion and duplicate-aware storage.
- Web-page extraction foundation.
- Environment configuration and scheduled ingestion.

## Phase 2 — Research usability
- REST API and authentication.
- Search, filtering, pagination, citations, and export.
- Source provenance and content hashing.
- Retry policy, rate limiting, and durable job locking.
- Unit/integration tests and CI.

## Phase 3 — AI-assisted review
- Citation-grounded paper summarization.
- Structured extraction of architectures, datasets, optimizers, hyperparameters, benchmarks, and limitations.
- Claims/evidence table linking output claims to sources.
- Human approval before publishing generated conclusions.

## Phase 4 — Neural-network experiments
- Model registry and dataset versioning.
- Experiment configurations stored as versioned JSON.
- Metrics, checkpoints, random seeds, and hardware/runtime metadata.
- Separate Python worker for PyTorch/TensorFlow training.
- Benchmark comparison and repeatability reports.

## Phase 5 — Knowledge retrieval
- Embeddings and vector index.
- Hybrid keyword/semantic retrieval.
- Citation graph and related-paper recommendations.
- Retrieval-augmented assistant with source snippets and explicit uncertainty.

## Engineering requirements
- Keep secrets in environment variables; never commit .env.
- Use least-privilege database credentials.
- Respect source terms, rate limits, licensing, and robots policies.
- Do not represent AI-generated analysis as validated evidence without human review or reproduced results.
