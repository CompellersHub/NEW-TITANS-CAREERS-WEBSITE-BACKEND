import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runMigration() {
    let client: Client | undefined;
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is not set in environment variables');
        }

        client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false }
        });

        await client.connect();
        console.log('Connected to database.');

        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251218134500_fix_voucher_relationship.sql');
        console.log(`Reading migration file from: ${migrationPath}`);

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...');
        await client.query(sql);
        console.log('Migration executed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (client) {
            await client.end();
            console.log('Disconnected from database.');
        }
    }
}

runMigration();
