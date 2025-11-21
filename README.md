# Meme Generator - Full Stack App

A Next.js full-stack meme generator application using InstantDB for real-time data synchronization.

## Features

- **Create Memes**: Upload images or use templates, add text overlays with customizable fonts and colors
- **Browse & Upvote**: View all posted memes and upvote your favorites
- **Real-time Updates**: See new memes and upvotes instantly using InstantDB
- **User Authentication**: Secure signup and login powered by InstantDB

## Tech Stack

- **Next.js 14** with App Router
- **React 18** with TypeScript
- **InstantDB** for database and authentication
- **Canvas API** for meme generation

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
/app
  /auth          # Authentication page
  /create        # Meme creation page
  /browse        # Meme feed/browse page
  layout.tsx     # Root layout with navigation
  page.tsx       # Home page (redirects to /create)
/components
  /meme          # Meme-related components
    MemeCanvas.tsx
    MemeControls.tsx
    MemeCard.tsx
    UpvoteButton.tsx
    TemplateSelector.tsx
  Navbar.tsx     # Navigation component
/lib
  db.ts          # InstantDB initialization
instant.schema.ts # Database schema
/public
  /assets        # Template images
```

## InstantDB Configuration

The app uses InstantDB with app ID: `f512d6cc-620d-41c8-82b3-9e58a194348f`

Schema includes:
- **memes**: Stores meme images (base64), text box configurations, creation date, creator, and upvote count
- **upvotes**: Tracks individual upvotes linking users to memes
- **users**: Managed by InstantDB auth system

## Usage

1. **Sign Up/Login**: Create an account or login at `/auth`
2. **Create Meme**: Go to `/create` to upload an image or select a template, add text, and customize
3. **Post Meme**: Click "Post Meme" to share your creation
4. **Browse**: Visit `/browse` to see all memes and upvote your favorites

## Development

- The app uses TypeScript for type safety
- Real-time updates are handled automatically by InstantDB hooks
- Canvas operations are optimized for high-quality meme generation
- Responsive design works on mobile and desktop

## Deployment

The app can be deployed to Vercel, Netlify, or any platform that supports Next.js.

```bash
npm run build
npm start
```

## Notes

- Images are stored as base64 strings in InstantDB (consider migrating to external storage for production)
- Template images are located in `/public/assets/`
- Authentication is handled entirely by InstantDB

