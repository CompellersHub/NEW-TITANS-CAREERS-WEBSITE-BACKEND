import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function checkConstraints() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'scheduled_voucher_campaigns';
        `);
        console.log("Constraints info:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
checkConstraints();
