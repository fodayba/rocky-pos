import * as mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...\n');

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
  }

  // Hide password in logs
  const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
  console.log(`📡 Connecting to: ${maskedUri}\n`);

  try {
    // Attempt connection
    await mongoose.connect(mongoUri);

    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    // Get connection details
    const connection = mongoose.connection;
    console.log('📊 Connection Details:');
    console.log(`   Host: ${connection.host}`);
    console.log(`   Database: ${connection.name}`);
    console.log(`   Port: ${connection.port}`);
    console.log(`   Ready State: ${connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`);

    // List existing collections
    const collections = await connection.db.listCollections().toArray();

    if (collections.length > 0) {
      console.log('📂 Existing Collections:');
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
      console.log('');
    } else {
      console.log('📂 No collections found (database is empty)');
      console.log('   Run "npm run seed" to populate the database\n');
    }

    // Get database stats
    const stats = await connection.db.stats();
    console.log('💾 Database Stats:');
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`);

    console.log('✨ Connection test completed successfully!');

  } catch (error) {
    console.error('❌ Connection failed!\n');

    if (error instanceof Error) {
      console.error('Error Message:', error.message);

      // Provide helpful error messages
      if (error.message.includes('Authentication failed')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check your username and password in .env');
        console.error('   2. Make sure special characters in password are URL encoded');
        console.error('   3. Verify the database user exists in MongoDB Atlas');
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check your Network Access settings in MongoDB Atlas');
        console.error('   2. Make sure your IP address is whitelisted');
        console.error('   3. Check if cluster is active (not paused)');
      } else if (error.message.includes('Invalid connection string')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check MONGODB_URI format in .env');
        console.error('   2. Make sure all placeholders are replaced');
        console.error('   3. Format: mongodb+srv://username:password@cluster.mongodb.net/database');
      }
    }

    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testConnection();
