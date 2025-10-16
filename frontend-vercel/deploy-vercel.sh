#!/bin/bash

echo "🚀 Deploying Frontend to Vercel..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Frontend deployed successfully!"
echo "🔗 Your app will be available at the Vercel URL"
