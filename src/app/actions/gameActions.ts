// app/actions/gameActions.ts
'use server';

import { z } from 'zod';
import { getCollection } from '@/lib/database'; // db.tsx is in lib
import type { Player } from '@/types/othello';

// Define the shape of a single move for validation
const MoveSchema = z.object({
  row: z.number().int().min(0).max(7),
  col: z.number().int().min(0).max(7),
});

// Define the schema for the entire game data we expect from the client
const GameDataSchema = z.object({
  gameMode: z.enum(['playerVsAi', 'aiVsAi']),
  userPlayer: z.enum(['black', 'white']).nullable(),
  winner: z.enum(['black', 'white', 'draw']),
  finalScore: z.object({
    black: z.number().int(),
    white: z.number().int(),
  }),
  // We only need the player and the move, not the entire board state for each step
  moveHistory: z.array(z.object({
    player: z.enum(['black', 'white']),
    move: MoveSchema.nullable(),
  })),
  difficulty: z.number().optional(), // For Player vs AI
  aiDifficulties: z.object({ // For AI vs AI
    ai1: z.number(),
    ai2: z.number(),
  }).optional(),
});

type GameData = z.infer<typeof GameDataSchema>;

/**
 * Saves a completed Othello game to the MongoDB database.
 * This is a Server Action and can be called directly from client components.
 * @param gameData The complete data of the finished game.
 * @returns An object indicating success or failure.
 */
export async function saveGame(gameData: GameData) {
  try {
    // 1. Validate the incoming data against the schema
    const validatedData = GameDataSchema.parse(gameData);

    // 2. Get a connection to the 'games' collection
    const gamesCollection = await getCollection('games');

    // 3. Insert the validated game data, adding a timestamp
    const result = await gamesCollection.insertOne({
      ...validatedData,
      createdAt: new Date(),
    });

    console.log(`Game saved successfully with ID: ${result.insertedId}`);
    return { success: true, message: 'Game saved to database!' };

  } catch (error) {
    console.error('Failed to save game:', error);
    // Return a generic error message to the client for security
    return { success: false, message: 'An error occurred while saving the game.' };
  }
}
