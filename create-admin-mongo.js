// Create an admin user in MongoDB
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function createAdmin() {
  // Read MongoDB URI from .env
  const envContent = fs.readFileSync('.env', 'utf8');
  const mongoUriMatch = envContent.match(/MONGODB_URI=(.*)/);
  const uri = mongoUriMatch ? mongoUriMatch[1].trim() : null;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    console.log('✅ Connected to MongoDB');

    // Hash password
    const password = 'admin123'; // Change this!
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = await db.collection('volunteers').findOne({
      email: 'admin@example.com'
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      await client.close();
      return;
    }

    // Create admin user
    const adminUser = {
      volunteer_id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: passwordHash,
      phone: '1234567890',
      join_date: new Date(),
      status: 'active',
      role: 'admin',
      created_at: new Date(),
    };

    await db.collection('volunteers').insertOne(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('⚠️  Remember to change the password after first login!');

    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
