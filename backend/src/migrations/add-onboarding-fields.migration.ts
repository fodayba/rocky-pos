import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Migration script to add onboarding fields to existing User documents
 * This ensures backward compatibility by marking all existing users as having completed onboarding
 */
async function migrateOnboardingFields() {
  try {
    console.log('Starting onboarding fields migration...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gas-metro';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = connection.db;
    const usersCollection = db.collection('users');

    // Get count of users that need migration
    const usersToMigrate = await usersCollection.countDocuments({
      onboardingCompleted: { $exists: false },
    });

    console.log(`Found ${usersToMigrate} users to migrate`);

    if (usersToMigrate === 0) {
      console.log('No users need migration. All users already have onboarding fields.');
      await connection.close();
      return;
    }

    // Update all existing users without onboarding fields
    const result = await usersCollection.updateMany(
      {
        onboardingCompleted: { $exists: false },
      },
      {
        $set: {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          onboardingProgress: {
            welcomeViewed: true,
            locationSetup: true,
            completionViewed: true,
          },
        },
      },
    );

    console.log(`Migration completed successfully!`);
    console.log(`- Matched documents: ${result.matchedCount}`);
    console.log(`- Modified documents: ${result.modifiedCount}`);

    // Verify the migration
    const verifyCount = await usersCollection.countDocuments({
      onboardingCompleted: true,
    });
    console.log(`Total users with onboardingCompleted=true: ${verifyCount}`);

    await connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    await connection.close();
    process.exit(1);
  }
}

// Run the migration
migrateOnboardingFields();
