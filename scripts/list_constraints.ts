import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function listConstraints() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as def
            FROM pg_constraint
            WHERE conrelid = 'public.scheduled_voucher_campaigns'::regclass;
        `);
        console.log("All constraints:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
listConstraints();
