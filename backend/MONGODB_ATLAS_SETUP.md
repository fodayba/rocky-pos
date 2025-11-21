# MongoDB Atlas Setup Guide

This guide will help you configure MongoDB Atlas for the Rocky POS backend.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (or log in if you already have one)

## Step 2: Create a Cluster

1. After logging in, click **"Build a Database"** (or **"Create"** if you have existing clusters)
2. Choose the **FREE** tier (M0 Sandbox - perfect for development)
3. Select your preferred **Cloud Provider** and **Region** (choose one close to you for better latency)
4. Give your cluster a name (e.g., `rocky-pos-cluster`)
5. Click **"Create Cluster"** (it takes 1-3 minutes to provision)

## Step 3: Configure Database Access

### Create a Database User

1. In the left sidebar, click **"Database Access"** (under Security)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Set a **username** (e.g., `rocky_pos_user`)
5. Click **"Autogenerate Secure Password"** and **SAVE THIS PASSWORD**
6. Under **Database User Privileges**, select **"Read and write to any database"**
7. Click **"Add User"**

**IMPORTANT**: Save your username and password - you'll need them in the next steps!

## Step 4: Configure Network Access

1. In the left sidebar, click **"Network Access"** (under Security)
2. Click **"Add IP Address"**
3. For development, you have two options:
   - **Option A (Recommended for Development)**: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - **Option B (More Secure)**: Add your current IP address
4. Click **"Confirm"**

**Note**: For production, you should whitelist only your server's IP address.

## Step 5: Get Your Connection String

1. Go back to the **"Database"** section (left sidebar)
2. Click the **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose **Driver**: Node.js, **Version**: 5.5 or later
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Open `/home/user/rocky-pos/backend/.env`
2. Replace the placeholder values in `MONGODB_URI`:

```bash
# BEFORE (template):
MONGODB_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/rocky_pos?retryWrites=true&w=majority

# AFTER (with your actual values):
MONGODB_URI=mongodb+srv://rocky_pos_user:YourActualPassword123@cluster0.xxxxx.mongodb.net/rocky_pos?retryWrites=true&w=majority
```

**Replace**:
- `<username>` → Your database username (e.g., `rocky_pos_user`)
- `<password>` → Your database password (URL encode if it contains special characters)
- `<your-cluster>` → Your cluster name (e.g., `cluster0.xxxxx`)
- Keep `/rocky_pos` as the database name

### Important: URL Encoding Special Characters

If your password contains special characters like `@`, `#`, `$`, `%`, etc., you need to URL encode them:

| Character | Encoded |
|-----------|---------|
| @         | %40     |
| :         | %3A     |
| /         | %2F     |
| #         | %23     |
| ?         | %3F     |
| %         | %25     |

Example:
- Password: `My@Pass#123`
- Encoded: `My%40Pass%23123`

You can use this online tool: https://www.urlencoder.org/

## Step 7: Test Your Connection

Once you've updated the `.env` file, test the connection:

```bash
cd /home/user/rocky-pos/backend
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000/api
```

If you see connection errors, check:
1. Username and password are correct
2. Special characters in password are URL encoded
3. IP address is whitelisted in Network Access
4. Cluster is active (not paused)

## Step 8: Seed Your Database

Once connected, populate your database with initial data:

```bash
cd /home/user/rocky-pos/backend
npm run seed
```

This will create:
- 3 test users (admin, manager, cashier)
- 3 fuel products
- 14 minimart products
- 3 sample customers

### Test Credentials
After seeding, you can log in with:
- **Admin**: `admin` / `password123`
- **Manager**: `manager` / `password123`
- **Cashier**: `cashier` / `password123`

## Viewing Your Data in Atlas

1. Go to your cluster in MongoDB Atlas
2. Click **"Browse Collections"**
3. You'll see the `rocky_pos` database with collections:
   - `users`
   - `products`
   - `fuelproducts`
   - `customers`
   - `transactions`
   - `shifts`

## Troubleshooting

### Error: "Authentication failed"
- Check username and password in `.env`
- Make sure special characters are URL encoded

### Error: "Connection timeout"
- Check Network Access settings in Atlas
- Make sure your IP is whitelisted

### Error: "Cannot connect to cluster"
- Make sure cluster is not paused (Atlas pauses free clusters after inactivity)
- Check if cluster is fully provisioned (wait a few minutes)

### Error: "Database user not found"
- Make sure you created a database user in Step 3
- Username should match exactly (case-sensitive)

## Security Best Practices

### For Development:
✅ Allow access from anywhere (0.0.0.0/0)
✅ Use strong passwords
✅ Keep `.env` file out of version control (already in `.gitignore`)

### For Production:
🔒 Whitelist only your server's IP address
🔒 Use strong, randomly generated passwords
🔒 Enable MongoDB Atlas backup
🔒 Set up monitoring and alerts
🔒 Rotate passwords periodically
🔒 Use environment-specific clusters (dev, staging, production)

## Additional Resources

- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Connection String Format](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Security Best Practices](https://www.mongodb.com/docs/atlas/security/)

## Need Help?

If you encounter issues:
1. Check the MongoDB Atlas logs in the "Monitoring" tab
2. Review the NestJS application logs
3. Verify all configuration settings match this guide
