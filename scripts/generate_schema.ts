import fs from 'fs/promises';
import path from 'path';

async function generateSchema() {
    try {
        const schemaPath = path.join(process.cwd(), 'mongo_schema.json');
        const schemaRaw = await fs.readFile(schemaPath, 'utf8');
        const schema = JSON.parse(schemaRaw);

        let sql = `-- Generated SQL to create tables for all MongoDB collections\n\n`;

        // We focus on 'titans' database as per user request (prod data)
        // If 'titan_jobs' is also needed, we can add it. User said "all my collections", implied from the main DB.
        // But let's check both to be safe, prefixing if needed or just merging if names are unique.

        const databases = ['titans', 'titan_jobs'];

        for (const dbName of databases) {
            if (!schema[dbName]) continue;

            for (const [collectionName, fields] of Object.entries(schema[dbName])) {
                // Sanitize table name
                const tableName = collectionName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

                // Skip system collections if any
                if (tableName.startsWith('system_')) continue;

                sql += `-- Table for collection: ${dbName}.${collectionName}\n`;
                sql += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
                sql += `CREATE TABLE "${tableName}" (\n`;
                sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
                sql += `  mongo_id TEXT UNIQUE,\n`; // Store original _id
                sql += `  data JSONB,\n`; // Store full document

                // Add common useful columns if they exist in the field list
                // We cast to TEXT to be safe, as we don't know exact types from the JSON
                const fieldSet = new Set(fields as string[]);

                if (fieldSet.has('email')) sql += `  email TEXT,\n`;
                if (fieldSet.has('username')) sql += `  username TEXT,\n`;
                if (fieldSet.has('name')) sql += `  name TEXT,\n`;
                if (fieldSet.has('title')) sql += `  title TEXT,\n`;
                if (fieldSet.has('slug')) sql += `  slug TEXT,\n`;
                if (fieldSet.has('status')) sql += `  status TEXT,\n`;
                if (fieldSet.has('type')) sql += `  type TEXT,\n`;
                if (fieldSet.has('role')) sql += `  role TEXT,\n`;

                sql += `  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),\n`;
                sql += `  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()\n`;
                sql += `);\n\n`;

                // Add index on mongo_id for faster lookups/upserts
                sql += `CREATE INDEX idx_${tableName}_mongo_id ON "${tableName}" (mongo_id);\n`;
                // Add GIN index on data for JSON querying
                sql += `CREATE INDEX idx_${tableName}_data ON "${tableName}" USING gin (data);\n\n`;
            }
        }

        const outPath = path.join(process.cwd(), 'migrations', '02_create_all_tables.sql');
        await fs.writeFile(outPath, sql);
        console.log(`Generated SQL schema at ${outPath}`);

    } catch (err) {
        console.error("Failed to generate schema:", err);
    }
}

generateSchema();
