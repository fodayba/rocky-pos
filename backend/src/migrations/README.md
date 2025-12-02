# Database Migrations

This directory contains database migration scripts for the Gas Metro POS system.

## Running Migrations

Migrations are standalone TypeScript scripts that can be executed directly using ts-node.

### Prerequisites

Make sure you have:
1. MongoDB connection configured in `backend/.env`
2. ts-node installed (included in dev dependencies)

### Execute a Migration

From the backend directory, run:

```bash
npx ts-node src/migrations/<migration-file>.ts
```

### Available Migrations

#### add-onboarding-fields.migration.ts

**Purpose:** Adds onboarding tracking fields to existing User documents for backward compatibility.

**What it does:**
- Adds `onboardingCompleted: true` to all existing users
- Sets `onboardingCompletedAt` to current date
- Initializes `onboardingProgress` with all steps marked as complete

**When to run:** 
- After deploying the onboarding feature
- Before new users start signing up
- Only needs to be run once

**Command:**
```bash
cd backend
npx ts-node src/migrations/add-onboarding-fields.migration.ts
```

**Safety:**
- Only updates users that don't have onboarding fields
- Safe to run multiple times (idempotent)
- Provides detailed output of changes made

## Creating New Migrations

When creating a new migration:

1. Create a new file with descriptive name: `<description>.migration.ts`
2. Follow the pattern in existing migrations
3. Include error handling and logging
4. Make migrations idempotent (safe to run multiple times)
5. Document the migration in this README
6. Test on a development database first

## Best Practices

- Always backup your database before running migrations
- Test migrations on development/staging environments first
- Make migrations reversible when possible
- Log all changes for audit purposes
- Use transactions when modifying multiple collections
