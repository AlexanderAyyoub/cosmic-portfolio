import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

export { db };