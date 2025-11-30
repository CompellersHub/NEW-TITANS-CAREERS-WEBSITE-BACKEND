import { Client } from 'pg';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function runMigration() {
    // Use the pooler URL if available, else standard
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("DATABASE_URL not found in .env");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to database");

        const sqlPath = path.join(process.cwd(), 'migrations', '02_create_all_tables.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');

        console.log("Running full schema migration...");
        await client.query(sql);
        console.log("Full schema migration applied successfully!");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

runMigration();
