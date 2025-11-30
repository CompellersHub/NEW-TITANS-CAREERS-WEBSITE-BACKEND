import { MongoClient } from 'mongodb';
import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

// MongoDB Config - Try multiple connection options
const MONGO_URI_OPTIONS = [
    // Option 1: Standard SRV (recommended)
    "mongodb+srv://@cluster0.tu1atbz.mongodb.net/titans?retryWrites=true&w=majority",
    // Option 2: Direct connection (with fixes)
    "mongodb://@cluster0-shard-00-00.tu1atbz.mongodb.net:27017,cluster0-shard-00-01.tu1atbz.mongodb.net:27017,cluster0-shard-00-02.tu1atbz.mongodb.net:27017/titans?ssl=true&replicaSet=atlas-tu1atbz-shard-0&authSource=admin&retryWrites=true&w=majority",
    // Option 3: Simple direct connection to primary
    "mongodb://@cluster0-shard-00-00.tu1atbz.mongodb.net:27017/titans?ssl=true&authSource=admin&retryWrites=true&w=majority"
];

async function testMongoConnection(uri: string, optionName: string) {
    console.log(`\n🔍 Testing ${optionName}:`);
    const testClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
    });

    try {
        await testClient.connect();
        const db = testClient.db('titans');
        await db.command({ ping: 1 });
        console.log('✅ Connection successful!');
        await testClient.close();
        return true;
    } catch (error) {
        console.log(`❌ Connection failed: ${(error as Error).message}`);
        await testClient.close();
        return false;
    }
}

async function findWorkingConnection() {
    // Check .env first
    if (process.env.MONGO_URI) {
        console.log("Checking MONGO_URI from .env...");
        if (await testMongoConnection(process.env.MONGO_URI, "Env URI")) {
            return process.env.MONGO_URI;
        }
    }

    for (let i = 0; i < MONGO_URI_OPTIONS.length; i++) {
        const success = await testMongoConnection(MONGO_URI_OPTIONS[i], `Option ${i + 1}`);
        if (success) {
            console.log(`\n🎉 Using Option ${i + 1} for migration`);
            return MONGO_URI_OPTIONS[i];
        }
    }
    throw new Error('All connection attempts failed');
}

async function migrate() {
    let mongoClient: MongoClient | undefined;
    let pgClient: Client | undefined;

    try {
        // 1. Connect to MongoDB
        const MONGO_URI = await findWorkingConnection();
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        const db = mongoClient.db('titans');
        console.log("Connected to MongoDB.");

        // 2. Connect to Supabase
        const supabaseUrl = process.env.DATABASE_URL;
        if (!supabaseUrl) throw new Error("Missing DATABASE_URL");

        pgClient = new Client({
            connectionString: supabaseUrl,
            ssl: { rejectUnauthorized: false }
        });
        await pgClient.connect();
        console.log("Connected to Supabase.");

        // 3. Read Schema to get list of collections
        const schemaPath = path.join(process.cwd(), 'mongo_schema.json');
        const schemaRaw = await fs.readFile(schemaPath, 'utf8');
        const schema = JSON.parse(schemaRaw);

        // 4. Iterate and Migrate
        const dbName = 'titans';
        if (!schema[dbName]) {
            console.error(`Database '${dbName}' not found in schema file.`);
            return;
        }

        for (const [collectionName, fields] of Object.entries(schema[dbName])) {
            const tableName = collectionName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            if (tableName.startsWith('system_')) continue;

            console.log(`\n--- Migrating ${collectionName} -> ${tableName} ---`);

            const collection = db.collection(collectionName);
            const totalDocs = await collection.countDocuments();
            console.log(`Found ${totalDocs} documents.`);

            if (totalDocs === 0) continue;

            const cursor = collection.find({});
            let count = 0;
            let errors = 0;

            // Process in chunks to avoid memory issues, but simple loop is fine for <10k docs
            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                if (!doc) continue;

                try {
                    // Prepare values
                    const mongoId = doc._id.toString();
                    const data = JSON.stringify(doc);
                    const id = crypto.randomUUID(); // Generate new UUID

                    // Extract common fields if they exist
                    const email = doc.email || null;
                    const username = doc.username || null;
                    const name = doc.name || null;
                    const title = doc.title || null;
                    const slug = doc.slug || null;
                    const status = doc.status || null;
                    const type = doc.type || null;
                    const role = doc.role || null;

                    // Construct Query dynamically based on what columns we created
                    // We know we created: id, mongo_id, data, created_at, updated_at
                    // And optionally: email, username, name, title, slug, status, type, role

                    // To be safe and fast, we'll try to insert into all columns that might exist.
                    // But if the column doesn't exist, it will fail.
                    // Better approach: We know exactly what columns we created in generate_schema.ts based on the field list.
                    // So we check if the field exists in the schema list for this collection.

                    const fieldSet = new Set(fields as string[]);
                    const columns = ['id', 'mongo_id', 'data'];
                    const values: any[] = [id, mongoId, data];
                    let paramIndex = 4; // Start after $3

                    if (fieldSet.has('email')) { columns.push('email'); values.push(email); }
                    if (fieldSet.has('username')) { columns.push('username'); values.push(username); }
                    if (fieldSet.has('name')) { columns.push('name'); values.push(name); }
                    if (fieldSet.has('title')) { columns.push('title'); values.push(title); }
                    if (fieldSet.has('slug')) { columns.push('slug'); values.push(slug); }
                    if (fieldSet.has('status')) { columns.push('status'); values.push(status); }
                    if (fieldSet.has('type')) { columns.push('type'); values.push(type); }
                    if (fieldSet.has('role')) { columns.push('role'); values.push(role); }

                    // Add timestamps
                    columns.push('created_at', 'updated_at');
                    values.push(new Date(), new Date());

                    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                    const query = `
                        INSERT INTO "${tableName}" (${columns.join(', ')})
                        VALUES (${placeholders})
                        ON CONFLICT (mongo_id) DO UPDATE SET
                            data = EXCLUDED.data,
                            updated_at = NOW();
                    `;

                    await pgClient.query(query, values);
                    count++;
                    if (count % 100 === 0) process.stdout.write('.');

                } catch (e) {
                    errors++;
                    // console.error(`Error inserting doc ${doc._id}:`, e);
                }
            }
            console.log(`\nDone. Migrated: ${count}, Errors: ${errors}`);
        }

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoClient?.close();
        await pgClient?.end();
    }
}

migrate();