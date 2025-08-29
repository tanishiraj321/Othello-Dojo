# Vercel Environment Variables & Secrets Configuration

## Overview
This guide explains how to configure environment variables and secrets for the Othello Dojo application deployed on Vercel, including MongoDB Atlas connection and Gemini AI API integration.

## Environment Variables Structure

### Public Variables (Client-Side)
These variables are exposed to the browser and must be prefixed with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_API_URL=https://othello-dojo.vercel.app/api
NEXT_PUBLIC_APP_URL=https://othello-dojo.vercel.app
```

### Private Variables (Server-Side Only)
These variables are only available on the server and should never be exposed to the client:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/othello_dojo?retryWrites=true&w=majority
MONGODB_DB_NAME=othello_dojo

# Gemini AI Configuration
GOOGLE_AI_API_KEY=your-gemini-api-key-here

# Application Security
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Environment
NODE_ENV=production
```

## Setting Up Vercel Environment Variables

### Method 1: Vercel Dashboard (Recommended)

1. **Access Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `othello-dojo` project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Select **Environment Variables**

3. **Add Environment Variables**
   - Click **Add New**
   - Add each variable with the following configuration:

#### Public Variables (Client-Side)
| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://othello-dojo.vercel.app/api` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://othello-dojo.vercel.app` | Production, Preview, Development |

#### Private Variables (Server-Side)
| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/othello_dojo?retryWrites=true&w=majority` | Production, Preview, Development |
| `MONGODB_DB_NAME` | `othello_dojo` | Production, Preview, Development |
| `GOOGLE_AI_API_KEY` | `your-actual-gemini-api-key` | Production, Preview, Development |
| `SESSION_SECRET` | `your-super-secret-session-key` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production, Preview, Development |

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Add Environment Variables**
   ```bash
   # Add public variables
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_APP_URL
   
   # Add private variables
   vercel env add MONGODB_URI
   vercel env add MONGODB_DB_NAME
   vercel env add GOOGLE_AI_API_KEY
   vercel env add SESSION_SECRET
   vercel env add NODE_ENV
   ```

4. **Deploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Cluster
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Choose your preferred cloud provider and region

### 2. Configure Database Access
1. Go to **Database Access**
2. Create a new database user
3. Set username and password (save these securely)

### 3. Configure Network Access
1. Go to **Network Access**
2. Add IP address: `0.0.0.0/0` (allows access from anywhere)
3. Or add Vercel's IP ranges for better security

### 4. Get Connection String
1. Go to **Clusters** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<username>`, `<password>`, and `<dbname>` with your values

**Example Connection String:**
```
mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/othello_dojo?retryWrites=true&w=majority
```

## Gemini AI API Setup

### 1. Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Go to **API Keys** section
4. Create a new API key
5. Copy the API key

### 2. Set Environment Variable
Add the API key to Vercel environment variables:
```env
GOOGLE_AI_API_KEY=your-actual-gemini-api-key-here
```

## Security Best Practices

### 1. Environment-Specific Configuration
- **Production**: Use production MongoDB cluster and API keys
- **Preview**: Use staging MongoDB cluster and API keys
- **Development**: Use local MongoDB or development cluster

### 2. API Key Security
- Never commit API keys to version control
- Use Vercel's environment variables for all secrets
- Rotate API keys regularly
- Use least-privilege access for database users

### 3. Database Security
- Use strong passwords for database users
- Enable MongoDB Atlas security features
- Consider using VPC peering for enhanced security
- Enable audit logging for production

## Testing Configuration

### 1. Verify Environment Variables
Create a test API route to verify configuration:

```typescript
// src/app/api/test-config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    hasMongoDb: !!process.env.MONGODB_URI,
    hasGeminiKey: !!process.env.GOOGLE_AI_API_KEY,
    environment: process.env.NODE_ENV,
  });
}
```

### 2. Test Database Connection
Create a database health check endpoint:

```typescript
// src/app/api/health/db/route.ts
import { NextResponse } from 'next/server';
import { isDatabaseConnected } from '@/lib/database';

export async function GET() {
  try {
    const isConnected = await isDatabaseConnected();
    return NextResponse.json({
      status: isConnected ? 'healthy' : 'unhealthy',
      database: 'MongoDB Atlas',
      connected: isConnected,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure variables are added to the correct environment (Production/Preview/Development)
   - Redeploy after adding new environment variables
   - Check variable names for typos

2. **MongoDB Connection Issues**
   - Verify connection string format
   - Check network access settings in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Gemini API Errors**
   - Verify API key is correct
   - Check API key permissions and quotas
   - Ensure API key is enabled for the correct project

### Debug Commands

```bash
# Check Vercel environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Deploy with specific environment
vercel --prod
```

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with appropriate permissions
- [ ] Network access configured (IP whitelist or 0.0.0.0/0)
- [ ] Gemini AI API key obtained and configured
- [ ] All environment variables set in Vercel dashboard
- [ ] Environment variables tested in preview deployment
- [ ] Security settings reviewed and configured
- [ ] Application deployed and tested in production

## Cost Considerations

### MongoDB Atlas
- Free tier: 512MB storage, shared clusters
- Paid tiers: Starting at $9/month for dedicated clusters
- Consider usage patterns and scale accordingly

### Gemini AI API
- Free tier: 15 requests per minute
- Paid tier: $0.0005 per 1K characters input, $0.0015 per 1K characters output
- Monitor usage to avoid unexpected costs

### Vercel
- Free tier: 100GB bandwidth, 100GB storage
- Paid tier: Starting at $20/month for Pro plan
- Consider usage patterns for optimal plan selection
