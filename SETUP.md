# Quick Setup Guide

## Prerequisites
- Node.js installed (v18 or higher)
- InstantDB account (sign up at https://instantdb.com)

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Login to InstantDB** (first time only)
   ```bash
   npx instant-cli login
   ```
   This will open your browser to authenticate.

3. **Push Schema to InstantDB**
   ```bash
   npx instant-cli push
   ```
   This uploads your schema from `instant.schema.ts` to your InstantDB app.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

## Troubleshooting

- If `npx instant-cli` doesn't work, make sure you have Node.js installed
- If schema push fails, verify your app ID in `lib/db.ts` matches your InstantDB dashboard
- Check browser console for any InstantDB connection errors

## Your InstantDB App ID
`f512d6cc-620d-41c8-82b3-9e58a194348f`

Make sure this matches your InstantDB dashboard!

