import { pgTable, serial, text, integer, timestamp, boolean, jsonb,real } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Models table
export const models = pgTable("models", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
  contentType: text("content_type").notNull(),

  // New fields
  modelType: text("model_type").notNull(),
  description: text("description").notNull(),
  algorithm: text("algorithm").notNull(),
  features: text("features").notNull(), // comma-separated string
  targetVariable: text("target_variable").notNull(),

  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
})
// Datasets table
export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
  contentType: text("content_type").notNull(),
  isGenerated: boolean("is_generated").default(false),
  modelId: integer("model_id").references(() => models.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Analyses table
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id")
    .notNull()
    .references(() => models.id, { onDelete: "cascade" }),
  datasetId: integer("dataset_id").references(() => datasets.id, { onDelete: "set null" }),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})



// Relations
export const modelsRelations = relations(models, ({ many }) => ({
  datasets: many(datasets),
  analyses: many(analyses),
}))

export const datasetsRelations = relations(datasets, ({ one }) => ({
  model: one(models, {
    fields: [datasets.modelId],
    references: [models.id],
  }),
}))

export const analysesRelations = relations(analyses, ({ one }) => ({
  model: one(models, {
    fields: [analyses.modelId],
    references: [models.id],
  }),
  dataset: one(datasets, {
    fields: [analyses.datasetId],
    references: [datasets.id],
  }),
}))
