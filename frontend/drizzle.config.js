
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './configs/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url:'postgresql://neondb_owner:npg_WI7t8LsohNkr@ep-curly-credit-a5glxmjx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
  },
});
