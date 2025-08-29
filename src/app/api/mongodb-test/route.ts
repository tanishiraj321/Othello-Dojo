/**
 * MongoDB Connection Test & Analysis Endpoint
 * 
 * This endpoint performs comprehensive MongoDB connection tests and setup verification.
 * It checks connection, database creation, collections, indexes, and data operations.
 */

import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as any,
    summary: {} as any,
    recommendations: [] as string[]
  };

  try {
    // Test 1: Environment Variables Check
    results.tests.environmentVariables = {
      hasMongoDbUri: !!process.env.MONGODB_URI,
      hasMongoDbName: !!process.env.MONGODB_DB_NAME,
      mongoDbName: process.env.MONGODB_DB_NAME || 'NOT SET',
      uriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      uriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 25) + '...' : 'NOT SET'
    };

    if (!process.env.MONGODB_URI) {
      results.recommendations.push('MONGODB_URI environment variable is not set');
      return NextResponse.json(results, { status: 400 });
    }

    if (!process.env.MONGODB_DB_NAME) {
      results.recommendations.push('MONGODB_DB_NAME environment variable is not set');
    }

    // Test 2: Basic Connection Test
    let client: MongoClient | null = null;
    try {
      client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      });

      await client.connect();
      results.tests.basicConnection = {
        status: 'SUCCESS',
        message: 'MongoDB client connected successfully'
      };
    } catch (error) {
      results.tests.basicConnection = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to connect to MongoDB'
      };
      results.recommendations.push('Check MongoDB URI format and network access');
      return NextResponse.json(results, { status: 500 });
    }

    // Test 3: Database Ping Test
    try {
      await client.db().admin().ping();
      results.tests.databasePing = {
        status: 'SUCCESS',
        message: 'Database ping successful'
      };
    } catch (error) {
      results.tests.databasePing = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database ping failed'
      };
      results.recommendations.push('Database ping failed - check cluster status');
    }

    // Test 4: Database Access Test
    try {
      const db = client.db(process.env.MONGODB_DB_NAME);
      const collections = await db.listCollections().toArray();
      results.tests.databaseAccess = {
        status: 'SUCCESS',
        message: 'Database access successful',
        collections: collections.map(col => col.name),
        collectionCount: collections.length
      };
    } catch (error) {
      results.tests.databaseAccess = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database access failed'
      };
      results.recommendations.push('Check database user permissions');
    }

    // Test 5: Collections Setup Test
    try {
      const db = client.db(process.env.MONGODB_DB_NAME);
      
      // Check if required collections exist
      const requiredCollections = ['games', 'moves'];
      const existingCollections = await db.listCollections().toArray();
      const existingCollectionNames = existingCollections.map(col => col.name);
      
      const missingCollections = requiredCollections.filter(col => !existingCollectionNames.includes(col));
      
      results.tests.collectionsSetup = {
        status: missingCollections.length === 0 ? 'SUCCESS' : 'PARTIAL',
        existingCollections: existingCollectionNames,
        requiredCollections: requiredCollections,
        missingCollections: missingCollections,
        message: missingCollections.length === 0 ? 'All required collections exist' : `Missing collections: ${missingCollections.join(', ')}`
      };

      if (missingCollections.length > 0) {
        results.recommendations.push(`Create missing collections: ${missingCollections.join(', ')}`);
      }
    } catch (error) {
      results.tests.collectionsSetup = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Collections setup check failed'
      };
    }

    // Test 6: Indexes Test
    try {
      const db = client.db(process.env.MONGODB_DB_NAME);
      const gamesCollection = db.collection('games');
      const movesCollection = db.collection('moves');
      
      const gamesIndexes = await gamesCollection.indexes();
      const movesIndexes = await movesCollection.indexes();
      
      results.tests.indexes = {
        status: 'SUCCESS',
        gamesIndexes: gamesIndexes.map(idx => ({ name: idx.name, key: idx.key })),
        movesIndexes: movesIndexes.map(idx => ({ name: idx.name, key: idx.key })),
        message: 'Indexes retrieved successfully'
      };
    } catch (error) {
      results.tests.indexes = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Indexes check failed'
      };
    }

    // Test 7: Data Operations Test
    try {
      const db = client.db(process.env.MONGODB_DB_NAME);
      const testCollection = db.collection('test_operations');
      
      // Test insert
      const testDoc = {
        _id: new ObjectId(),
        test: true,
        timestamp: new Date(),
        message: 'Test operation successful'
      };
      
      await testCollection.insertOne(testDoc);
      
      // Test find
      const foundDoc = await testCollection.findOne({ _id: testDoc._id });
      
      // Test update
      await testCollection.updateOne(
        { _id: testDoc._id },
        { $set: { updated: true } }
      );
      
      // Test delete
      await testCollection.deleteOne({ _id: testDoc._id });
      
      results.tests.dataOperations = {
        status: 'SUCCESS',
        message: 'All CRUD operations successful',
        operations: ['insert', 'find', 'update', 'delete']
      };
    } catch (error) {
      results.tests.dataOperations = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Data operations test failed'
      };
      results.recommendations.push('Check database user write permissions');
    }

    // Test 8: Connection Pool Test
    try {
      const poolStats = await client.db().admin().serverStatus();
      results.tests.connectionPool = {
        status: 'SUCCESS',
        connections: {
          current: poolStats.connections?.current || 'N/A',
          available: poolStats.connections?.available || 'N/A',
          pending: poolStats.connections?.pending || 'N/A'
        },
        message: 'Connection pool information retrieved'
      };
    } catch (error) {
      results.tests.connectionPool = {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Connection pool test failed'
      };
    }

    // Summary
    const allTests = Object.values(results.tests);
    const successfulTests = allTests.filter((test: any) => test.status === 'SUCCESS').length;
    const failedTests = allTests.filter((test: any) => test.status === 'FAILED').length;
    const partialTests = allTests.filter((test: any) => test.status === 'PARTIAL').length;

    results.summary = {
      totalTests: allTests.length,
      successful: successfulTests,
      failed: failedTests,
      partial: partialTests,
      overallStatus: failedTests === 0 ? 'READY' : failedTests < allTests.length ? 'PARTIAL' : 'FAILED',
      setupComplete: failedTests === 0 && partialTests === 0
    };

    // Final recommendations
    if (results.summary.setupComplete) {
      results.recommendations.push('MongoDB setup is complete and ready for use!');
    } else {
      results.recommendations.push('Fix the issues above before proceeding with MongoDB integration');
    }

    // Cleanup
    if (client) {
      await client.close();
    }

    return NextResponse.json(results, {
      status: results.summary.overallStatus === 'READY' ? 200 : 207,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    results.tests.generalError = {
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'General test failure'
    };
    
    results.summary = {
      totalTests: 1,
      successful: 0,
      failed: 1,
      partial: 0,
      overallStatus: 'FAILED',
      setupComplete: false
    };

    return NextResponse.json(results, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
