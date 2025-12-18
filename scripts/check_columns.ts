import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function checkColumns() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns
            WHERE table_name = 'scheduled_voucher_campaigns';
        `);
        console.log("Columns:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
checkColumns();
