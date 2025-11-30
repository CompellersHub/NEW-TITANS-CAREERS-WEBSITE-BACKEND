import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function generateReport() {
    // URL for links in the report
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!supabaseUrl) {
        console.error("❌ Missing VITE_SUPABASE_URL, SUPABASE_DB_URL or DATABASE_URL");
        process.exit(1);
    }

    // Mask password for logging if it's a connection string
    const maskedUrl = supabaseUrl.includes('@') ? supabaseUrl.replace(/:[^:@]+@/, ':****@') : supabaseUrl;
    console.log(`ℹ️ Base URL for links: ${maskedUrl}`);

    // Connection string for pg client (must be the postgres connection string)
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (!dbUrl) {
        console.error("❌ Missing DATABASE_URL or SUPABASE_DB_URL for database connection");
        process.exit(1);
    }

    try {
        // Parse DB URL to check hostname
        // Handle postgres://user:pass@host:port/db format
        const match = dbUrl.match(/@([^:/]+)/);
        if (match) {
            const hostname = match[1];
            console.log(`ℹ️ DB Hostname: ${hostname}`);
            const dns = require('dns');
            dns.lookup(hostname, (err: any, address: any) => {
                if (err) console.error(`❌ DNS Lookup failed for DB host ${hostname}:`, err);
                else console.log(`✅ DNS Lookup successful for DB host: ${address}`);
            });
        }
    } catch (e) {
        console.error("❌ Error parsing DB URL");
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("✅ Connected to Supabase DB");

        // Read schema
        const schemaPath = path.join(process.cwd(), 'mongo_schema.json');
        const schemaRaw = fs.readFileSync(schemaPath, 'utf8');
        const schema = JSON.parse(schemaRaw);
        const dbName = 'titans';

        if (!schema[dbName]) {
            throw new Error(`Database '${dbName}' not found in schema`);
        }

        let markdownContent = `# Migration Report: Supabase URLs\n\n`;
        markdownContent += `**Generated at:** ${new Date().toLocaleString()}\n`;
        markdownContent += `**Base URL:** ${supabaseUrl}\n\n`;

        for (const [collectionName, fields] of Object.entries(schema[dbName])) {
            const tableName = collectionName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            if (tableName.startsWith('system_')) continue;

            console.log(`Processing table: ${tableName}...`);

            try {
                // Check if table exists
                const tableCheck = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    );
                `, [tableName]);

                if (!tableCheck.rows[0].exists) {
                    console.log(`⚠️ Table ${tableName} does not exist in Supabase.`);
                    continue;
                }

                // Fetch records
                const res = await client.query(`SELECT * FROM "${tableName}" LIMIT 20`);
                const records = res.rows;

                markdownContent += `## Table: ${tableName}\n`;
                markdownContent += `**Total Records (Migrated):** ${records.length} (showing first 20)\n`;
                markdownContent += `**API Endpoint:** \`${supabaseUrl}/rest/v1/${tableName}\`\n\n`;

                if (records.length > 0) {
                    markdownContent += `| ID | Link |\n`;
                    markdownContent += `|---|---|\n`;

                    records.forEach((record: any) => {
                        const id = record.id || record.mongo_id || 'unknown';
                        // Construct URL
                        const url = `${supabaseUrl}/rest/v1/${tableName}?id=eq.${id}`;
                        markdownContent += `| ${id} | [API Link](${url}) |\n`;
                    });
                    markdownContent += `\n`;
                } else {
                    markdownContent += `*No records found.*\n\n`;
                }

            } catch (err) {
                console.error(`❌ Error processing table ${tableName}:`, err);
                markdownContent += `## Table: ${tableName}\n`;
                markdownContent += `*Error fetching data.*\n\n`;
            }
        }

        const outputPath = path.join(process.cwd(), 'migration_report.md');
        fs.writeFileSync(outputPath, markdownContent);

        console.log(`🎉 Report generated at: ${outputPath}`);

    } catch (err: any) {
        console.error("❌ Error generating report:", err);
    } finally {
        await client.end();
    }
}

generateReport();
