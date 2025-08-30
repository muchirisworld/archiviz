import { pgTable, text, timestamp, integer, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const symbolTypeEnum = pgEnum('symbol_type', [
  'function',
  'class',
  'interface',
  'variable',
  'import',
  'export',
  'type',
  'namespace',
  'module',
]);

export const dependencyTypeEnum = pgEnum('dependency_type', [
  'imports',
  'extends',
  'implements',
  'calls',
  'references',
  'depends_on',
]);

// Tables
export const repositories = pgTable('repositories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  lastParsed: timestamp('last_parsed').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const packages = pgTable('packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  path: text('path').notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  path: text('path').notNull(),
  packageId: uuid('package_id').references(() => packages.id, { onDelete: 'cascade' }),
  contentHash: text('content_hash').notNull(),
  language: text('language').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const symbols = pgTable('symbols', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: symbolTypeEnum('type').notNull(),
  fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }),
  startLine: integer('start_line').notNull(),
  endLine: integer('end_line').notNull(),
  startColumn: integer('start_column').notNull(),
  endColumn: integer('end_column').notNull(),
  signature: text('signature'),
  documentation: text('documentation'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dependencies = pgTable('dependencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => symbols.id, { onDelete: 'cascade' }),
  targetId: uuid('target_id').references(() => symbols.id, { onDelete: 'cascade' }),
  type: dependencyTypeEnum('type').notNull(),
  metadata: text('metadata'), // JSON string for additional info
  createdAt: timestamp('created_at').defaultNow(),
});


export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  vector: text('vector').notNull(), // Store as JSON string, pgvector will handle conversion
  symbolId: uuid('symbol_id').references(() => symbols.id, { onDelete: 'cascade' }),
  model: text('model').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Semantic Search & Analysis Tables
export const searchQueries = pgTable('search_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  query: text('query').notNull(),
  userId: text('user_id'),
  results: text('results'), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
});

export const analysisResults = pgTable('analysis_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  symbolId: uuid('symbol_id').references(() => symbols.id, { onDelete: 'cascade' }),
  analysisType: text('analysis_type').notNull(), // 'complexity', 'pattern', 'suggestion', etc.
  result: text('result').notNull(), // JSON string
  confidence: integer('confidence'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const repositoriesRelations = relations(repositories, ({ many }) => ({
  packages: many(packages),
}));

export const packagesRelations = relations(packages, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [packages.repositoryId],
    references: [repositories.id],
  }),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  package: one(packages, {
    fields: [files.packageId],
    references: [packages.id],
  }),
  symbols: many(symbols),
}));

export const symbolsRelations = relations(symbols, ({ one, many }) => ({
  file: one(files, {
    fields: [symbols.fileId],
    references: [files.id],
  }),
  sourceDependencies: many(dependencies, { relationName: 'source' }),
  targetDependencies: many(dependencies, { relationName: 'target' }),
  embeddings: many(embeddings),
}));

export const dependenciesRelations = relations(dependencies, ({ one }) => ({
  source: one(symbols, {
    fields: [dependencies.sourceId],
    references: [symbols.id],
    relationName: 'source',
  }),
  target: one(symbols, {
    fields: [dependencies.targetId],
    references: [symbols.id],
    relationName: 'target',
  }),
}));

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  symbol: one(symbols, {
    fields: [embeddings.symbolId],
    references: [symbols.id],
  }),
}));
