import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function checkConstraint() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT conname, obj_description(oid, 'pg_constraint') as comment
            FROM pg_constraint
            WHERE conname = 'scheduled_voucher_campaigns_voucher_id_fkey';
        `);
        console.log("Constraint info:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
checkConstraint();
