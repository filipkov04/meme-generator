# InstantDB Login & Setup Guide

## Important Note
**I cannot log in for you** - InstantDB requires browser authentication that only you can complete. However, I've created a script to help automate the process once Node.js is installed.

## Prerequisites
You need Node.js installed first. Here's how:

### Install Node.js

**Option 1: Download from website (Easiest)**
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Install the downloaded package
4. Restart your terminal

**Option 2: Using Homebrew (if you have it)**
```bash
brew install node
```

**Verify installation:**
```bash
node --version
npm --version
```

## Login Steps

### Method 1: Use the Setup Script (Recommended)
Once Node.js is installed, run:
```bash
./setup-instantdb.sh
```

This script will:
1. Check if Node.js is installed
2. Guide you through login (opens browser)
3. Push your schema automatically

### Method 2: Manual Steps

**Step 1: Login**
```bash
npx instant-cli login
```
- This opens your browser
- Sign up or log in to InstantDB
- Return to terminal when done

**Step 2: Push Schema**
```bash
npx instant-cli push
```
- Uploads your `instant.schema.ts` to InstantDB
- Creates the database tables

**Step 3: Start Dev Server**
```bash
npm install  # First time only
npm run dev
```

## Alternative: Web Dashboard Setup

If you prefer not to use the CLI:

1. **Go to https://instantdb.com**
2. **Sign up/Login** with your account
3. **Create a new app** (or use existing)
4. **Copy your App ID** from the dashboard
5. **Update `lib/db.ts`** if your App ID is different:
   ```typescript
   appId: 'your-app-id-here'
   ```
6. **Configure schema** in the InstantDB dashboard to match `instant.schema.ts`

## Your Current App ID
Make sure this matches your InstantDB dashboard:
```
f512d6cc-620d-41c8-82b3-9e58a194348f
```

## Troubleshooting

**"command not found: npx"**
- Node.js is not installed or not in PATH
- Install Node.js and restart terminal

**"Login failed"**
- Make sure you complete browser authentication
- Check your internet connection
- Try again: `npx instant-cli login`

**"Schema push failed"**
- Verify you're logged in: `npx instant-cli login`
- Check that `instant.schema.ts` exists
- Verify your app ID matches the dashboard

## Need Help?
- InstantDB Docs: https://instantdb.com/docs
- Check your app dashboard: https://instantdb.com/dashboard

