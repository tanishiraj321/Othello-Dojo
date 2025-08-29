/**
 * Debug API Endpoint
 * 
 * This endpoint helps debug environment variables and MongoDB connection.
 * It will show you exactly what's configured and what's working.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check all environment variables
    const envCheck = {
      // MongoDB Configuration
      hasMongoDbUri: !!process.env.MONGODB_URI,
      mongoDbUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      mongoDbUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
      hasMongoDbName: !!process.env.MONGODB_DB_NAME,
      mongoDbName: process.env.MONGODB_DB_NAME || 'NOT SET',
      
      // Gemini AI Configuration
      hasGeminiKey: !!process.env.GOOGLE_AI_API_KEY,
      geminiKeyLength: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0,
      
      // Application Configuration
      hasSessionSecret: !!process.env.SESSION_SECRET,
      sessionSecretLength: process.env.SESSION_SECRET ? process.env.SESSION_SECRET.length : 0,
      nodeEnv: process.env.NODE_ENV || 'NOT SET',
      
      // Public URLs
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    };

    // Test MongoDB connection if URI is available
    let mongoConnectionTest = null;
    if (process.env.MONGODB_URI) {
      try {
        // Import MongoDB client dynamically
        const { MongoClient } = await import('mongodb');
        
        const client = new MongoClient(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        
        await client.connect();
        await client.db().admin().ping();
        await client.close();
        
        mongoConnectionTest = {
          status: 'SUCCESS',
          message: 'MongoDB connection successful!'
        };
      } catch (error) {
        mongoConnectionTest = {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'MongoDB connection failed'
        };
      }
    } else {
      mongoConnectionTest = {
        status: 'SKIPPED',
        message: 'MONGODB_URI not set'
      };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      mongoConnection: mongoConnectionTest,
      message: 'Debug information retrieved successfully',
      instructions: {
        nextSteps: [
          'Check if all environment variables are set correctly',
          'Verify MongoDB URI format and credentials',
          'Ensure network access is configured in MongoDB Atlas',
          'Check if the database user has correct permissions'
        ]
      }
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Debug endpoint failed'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}


