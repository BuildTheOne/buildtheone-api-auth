import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './shared/drizzle',
  schema: './shared/drizzle/schema/*.schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL!,
  },
  casing: 'snake_case',
  schemaFilter: ['core'],
});
