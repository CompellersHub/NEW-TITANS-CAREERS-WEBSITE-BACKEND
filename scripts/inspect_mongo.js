import { MongoClient } from 'mongodb';
import fs from 'fs/promises';

const uri = "mongodb://titanscareer:TitansCareer@localhost:27017/titans";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db('titans');
    const course = await db.collection('courses').findOne({});

    const jobsDb = client.db('titan_jobs');
    const job = await jobsDb.collection('jobs').findOne({});

    const samples = {
      course,
      job
    };

    await fs.writeFile('mongo_samples.json', JSON.stringify(samples, null, 2));
    console.log("Samples written to mongo_samples.json");

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
