/**
 * @file model.ts
 * @description Single source of truth for all MongoDB data models and validation schemas
 * for the OthelloAI Dojo application. This file defines the canonical structure
 * for the 'games' collection.
 */

import { z } from 'zod';
import type { Player } from '@/types/othello'; // Assuming this type path is correct

// ============================================================================
// CORE VALIDATION SCHEMAS
// ============================================================================

/**
 * Defines the shape of a single move's coordinates.
 * Used within the MoveHistoryItemSchema.
 */
export const MoveSchema = z.object({
  row: z.number().int().min(0).max(7, "Row must be between 0 and 7"),
  col: z.number().int().min(0).max(7, "Column must be between 0 and 7"),
});

/**
 * Defines the shape of a single entry in the `moveHistory` array.
 * This represents one turn taken by a player. A null move indicates a skipped turn.
 */
export const MoveHistoryItemSchema = z.object({
  player: z.enum(['black', 'white']),
  move: MoveSchema.nullable(),
});

/**
 * The definitive schema for a 'game' document in the MongoDB collection.
 * It contains all metadata for a game session and embeds the full move
 * history directly within the document.
 */
export const GameDBSchema = z.object({
  gameMode: z.enum(['playerVsAi', 'aiVsAi']),
  userPlayer: z.enum(['black', 'white']).nullable(),
  difficulty: z.number().optional(),
  aiDifficulties: z.object({
    ai1: z.number(),
    ai2: z.number(),
  }).optional(),
  moveHistory: z.array(MoveHistoryItemSchema),
  status: z.enum(['in_progress', 'completed', 'abandoned']),
  winner: z.enum(['black', 'white', 'draw']).optional().nullable(),
  finalScore: z.object({
    black: z.number().int(),
    white: z.number().int(),
  }).optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

/**
 * TypeScript type inferred from the GameDBSchema.
 * Use this type for interacting with game documents in your application code.
 */
export type GameDocument = z.infer<typeof GameDBSchema>;

/**
 * TypeScript type for a single move object.
 */
export type Move = z.infer<typeof MoveSchema>;

/**
 * TypeScript type for a single item in the move history.
 */
export type MoveHistoryItem = z.infer<typeof MoveHistoryItemSchema>;
