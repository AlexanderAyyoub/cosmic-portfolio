import * as dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'drizzle-kit';

// Make sure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export default defineConfig({
    out: './drizzle',
    schema: './lib/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});