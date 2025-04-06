import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not defined. Using in-memory database for development.")
}

// Create a SQL client with the database URL
const sql = neon(process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/ml_analyzer")

// Create a database instance with the schema
export const db = drizzle(sql, { schema })

