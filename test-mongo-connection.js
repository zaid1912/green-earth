// Quick test to verify MongoDB connection
const { MongoClient } = require('mongodb');

async function testConnection() {
  // Read from .env file manually
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  const mongoUriMatch = envContent.match(/MONGODB_URI=(.*)/);
  const uri = mongoUriMatch ? mongoUriMatch[1].trim() : null;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/:[^:]*@/, ':****@')); // Hide password

  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    console.log('✅ Connected to MongoDB successfully!');
    console.log('Database name:', db.databaseName);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    await client.close();
    console.log('✅ Connection test complete!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
