CREATE DATABASE IF NOT EXISTS neural_research
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE neural_research;

CREATE TABLE IF NOT EXISTS research_sources (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_type ENUM('paper','web','dataset','repository','documentation','other') NOT NULL,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(2048) NULL,
  external_id VARCHAR(255) NULL,
  publisher VARCHAR(255) NULL,
  published_at DATETIME NULL,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  abstract TEXT NULL,
  content LONGTEXT NULL,
  metadata JSON NULL,
  content_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source_external (source_type, external_id),
  KEY idx_source_hash (content_hash),
  FULLTEXT KEY ft_source_text (title, abstract, content)
);

CREATE TABLE IF NOT EXISTS authors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  orcid VARCHAR(64) NULL UNIQUE,
  metadata JSON NULL,
  UNIQUE KEY uq_author_name (name)
);

CREATE TABLE IF NOT EXISTS source_authors (
  source_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  author_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (source_id, author_id),
  CONSTRAINT fk_sa_source FOREIGN KEY (source_id) REFERENCES research_sources(id) ON DELETE CASCADE,
  CONSTRAINT fk_sa_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS source_tags (
  source_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (source_id, tag_id),
  CONSTRAINT fk_st_source FOREIGN KEY (source_id) REFERENCES research_sources(id) ON DELETE CASCADE,
  CONSTRAINT fk_st_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS models (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  architecture VARCHAR(255) NULL,
  framework VARCHAR(100) NULL,
  parameter_count BIGINT UNSIGNED NULL,
  paper_source_id BIGINT UNSIGNED NULL,
  repository_url VARCHAR(2048) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_model_paper FOREIGN KEY (paper_source_id) REFERENCES research_sources(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS datasets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(100) NULL,
  modality VARCHAR(100) NULL,
  size_bytes BIGINT UNSIGNED NULL,
  source_url VARCHAR(2048) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  hypothesis TEXT NULL,
  status ENUM('planned','running','completed','failed','archived') NOT NULL DEFAULT 'planned',
  model_id BIGINT UNSIGNED NULL,
  dataset_id BIGINT UNSIGNED NULL,
  config JSON NOT NULL,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_experiment_model FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL,
  CONSTRAINT fk_experiment_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS experiment_observations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  experiment_id BIGINT UNSIGNED NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  step INT NULL,
  metric_value DOUBLE NULL,
  text_value TEXT NULL,
  observed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL,
  CONSTRAINT fk_observation_experiment FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
  KEY idx_observation_metric (experiment_id, metric_name, step)
);

CREATE TABLE IF NOT EXISTS research_runs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  status ENUM('running','success','failed') NOT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  records_found INT NOT NULL DEFAULT 0,
  records_created INT NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  metadata JSON NULL
);
