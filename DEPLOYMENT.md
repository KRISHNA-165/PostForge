# Vercel Deployment Guide

## Prerequisites
1. Ensure you have a Vercel account
2. Connect your GitHub repository to Vercel
3. Set up your Supabase project

## Environment Variables
Before deploying, you need to set up the following environment variables in your Vercel project:

### Required Environment Variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### How to set environment variables in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value

## Deployment Steps

### 1. Automatic Deployment (Recommended)
- Push your code to the main branch
- Vercel will automatically detect the changes and deploy
- The build process will use the `vercel.json` configuration

### 2. Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Build Configuration
The project is configured with:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Troubleshooting

### Common Issues:

1. **Build Fails with Environment Variables**
   - Ensure all required environment variables are set in Vercel
   - Check that variable names match exactly (case-sensitive)

2. **Large Bundle Size Warning**
   - The build is optimized with code splitting
   - Chunks are automatically created for better loading performance

3. **Supabase Connection Issues**
   - Verify your Supabase URL and keys are correct
   - Check that your Supabase project is active

4. **Routing Issues**
   - The app uses React Router with client-side routing
   - Vercel is configured to serve `index.html` for all routes

## File Structure for Deployment
```
project/
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore during deployment
├── vite.config.ts       # Optimized build configuration
├── package.json         # Dependencies and scripts
├── dist/               # Build output (generated)
└── src/                # Source code
```

## Performance Optimizations
- Code splitting implemented for better loading times
- Manual chunks for vendor libraries
- Optimized bundle sizes
- Gzip compression enabled

## Support
If you encounter issues:
1. Check the Vercel build logs
2. Verify environment variables
3. Test the build locally with `npm run build`
4. Check the browser console for runtime errors
