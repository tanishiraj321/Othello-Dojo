/**
 * MongoDB Data Models and Validation Schemas
 * 
 * This module defines the data models, validation schemas, and TypeScript interfaces
 * for the Othello Dojo MongoDB collections.
 * 
 * Collections:
 * - games: Complete game sessions with metadata
 * - moves: Individual moves with references to games
 * - users: User preferences and statistics (future expansion)
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';
import type { BoardState, Player, Move, GameMode } from '@/types/othello';

// ============================================================================
// BOARD STATE COMPRESSION UTILITIES
// ============================================================================

/**
 * Compress board state to string for efficient storage
 * Board is 8x8, each cell can be: empty (0), black (1), white (2)
 * Total: 64 cells * 2 bits = 128 bits = 16 bytes
 * 
 * @param board Board state to compress
 * @returns Compressed string representation
 */
export function compressBoardState(board: BoardState): string {
  let compressed = '';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      switch (cell) {
        case 'empty':
          compressed += '0';
          break;
        case 'black':
          compressed += '1';
          break;
        case 'white':
          compressed += '2';
          break;
        default:
          throw new Error(`Invalid cell state: ${cell}`);
      }
    }
  }
  
  return compressed;
}

/**
 * Decompress board state from string
 * 
 * @param compressed Compressed board state string
 * @returns Decompressed board state
 * @throws Error if compressed string is invalid
 */
export function decompressBoardState(compressed: string): BoardState {
  if (compressed.length !== 64) {
    throw new Error(`Invalid compressed board state length: ${compressed.length}`);
  }
  
  const board: BoardState = Array(8).fill(null).map(() => Array(8).fill('empty'));
  
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const char = compressed[i];
    
    switch (char) {
      case '0':
        board[row][col] = 'empty';
        break;
      case '1':
        board[row][col] = 'black';
        break;
      case '2':
        board[row][col] = 'white';
        break;
      default:
        throw new Error(`Invalid character in compressed board state: ${char}`);
    }
  }
  
  return board;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Move validation schema
 */
export const MoveSchema = z.object({
  row: z.number().min(0).max(7),
  col: z.number().min(0).max(7),
});

/**
 * Tiles flipped validation schema
 */
export const TilesFlippedSchema = z.array(
  z.object({
    row: z.number().min(0).max(7),
    col: z.number().min(0).max(7),
  })
);

/**
 * Score validation schema
 */
export const ScoreSchema = z.object({
  black: z.number().min(0).max(64),
  white: z.number().min(0).max(64),
});

/**
 * Game mode validation schema
 */
export const GameModeSchema = z.enum(['playerVsAi', 'aiVsAi']);

/**
 * Player validation schema
 */
export const PlayerSchema = z.enum(['black', 'white']);

/**
 * Game state validation schema
 */
export const GameStateSchema = z.enum(['playing', 'gameOver']);

/**
 * Winner validation schema
 */
export const WinnerSchema = z.enum(['black', 'white', 'draw']);

// ============================================================================
// MOVE DOCUMENT SCHEMA
// ============================================================================

/**
 * Move document validation schema for MongoDB
 */
export const MoveDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  gameId: z.string().min(1, 'Game ID is required'),
  moveNumber: z.number().min(1, 'Move number must be at least 1'),
  player: PlayerSchema,
  row: z.number().min(0).max(7),
  col: z.number().min(0).max(7),
  boardStateBefore: z.string().length(64, 'Board state must be exactly 64 characters'),
  boardStateAfter: z.string().length(64, 'Board state must be exactly 64 characters'),
  tilesFlipped: TilesFlippedSchema,
  timestamp: z.date(),
  isValidMove: z.boolean(),
});

/**
 * Move document interface
 */
export interface MoveDocument extends z.infer<typeof MoveDocumentSchema> {
  _id?: ObjectId;
}

/**
 * Create move document from game data
 * 
 * @param gameId Game identifier
 * @param moveNumber Sequential move number
 * @param player Player making the move
 * @param move Move coordinates
 * @param boardBefore Board state before move
 * @param boardAfter Board state after move
 * @param tilesFlipped Tiles that were flipped
 * @param isValidMove Whether the move was valid
 * @returns Move document
 */
export function createMoveDocument(
  gameId: string,
  moveNumber: number,
  player: Player,
  move: Move,
  boardBefore: BoardState,
  boardAfter: BoardState,
  tilesFlipped: Move[],
  isValidMove: boolean = true
): MoveDocument {
  return {
    gameId,
    moveNumber,
    player,
    row: move.row,
    col: move.col,
    boardStateBefore: compressBoardState(boardBefore),
    boardStateAfter: compressBoardState(boardAfter),
    tilesFlipped: tilesFlipped.map(tile => ({ row: tile.row, col: tile.col })),
    timestamp: new Date(),
    isValidMove,
  };
}

// ============================================================================
// GAME DOCUMENT SCHEMA
// ============================================================================

/**
 * Game document validation schema for MongoDB
 */
export const GameDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  gameId: z.string().min(1, 'Game ID is required'),
  createdAt: z.date(),
  updatedAt: z.date(),
  gameMode: GameModeSchema,
  difficulty: z.number().min(1).max(5),
  ai1Difficulty: z.number().min(1).max(5).optional(),
  ai2Difficulty: z.number().min(1).max(5).optional(),
  userPlayer: PlayerSchema.nullable(),
  currentPlayer: PlayerSchema,
  gameState: GameStateSchema,
  finalScore: ScoreSchema.optional(),
  winner: WinnerSchema.optional(),
  isActive: z.boolean(),
  totalMoves: z.number().min(0),
  initialBoardState: z.string().length(64, 'Initial board state must be exactly 64 characters'),
});

/**
 * Game document interface
 */
export interface GameDocument extends z.infer<typeof GameDocumentSchema> {
  _id?: ObjectId;
}

/**
 * Create game document from game data
 * 
 * @param gameId Game identifier
 * @param gameMode Game mode
 * @param difficulty AI difficulty
 * @param userPlayer User player color
 * @param initialBoard Initial board state
 * @param ai1Difficulty AI 1 difficulty (for AI vs AI)
 * @param ai2Difficulty AI 2 difficulty (for AI vs AI)
 * @returns Game document
 */
export function createGameDocument(
  gameId: string,
  gameMode: GameMode,
  difficulty: number,
  userPlayer: Player | null,
  initialBoard: BoardState,
  ai1Difficulty?: number,
  ai2Difficulty?: number
): GameDocument {
  const now = new Date();
  
  return {
    gameId,
    createdAt: now,
    updatedAt: now,
    gameMode,
    difficulty,
    ai1Difficulty,
    ai2Difficulty,
    userPlayer,
    currentPlayer: 'black', // Games always start with black
    gameState: 'playing',
    isActive: true,
    totalMoves: 0,
    initialBoardState: compressBoardState(initialBoard),
  };
}

// ============================================================================
// USER DOCUMENT SCHEMA (FUTURE EXPANSION)
// ============================================================================

/**
 * User document validation schema for MongoDB
 */
export const UserDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string().min(1, 'User ID is required'),
  username: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  preferences: z.object({
    defaultDifficulty: z.number().min(1).max(5).default(3),
    defaultGameMode: GameModeSchema.default('playerVsAi'),
    defaultUserPlayer: PlayerSchema.default('black'),
    soundEnabled: z.boolean().default(true),
    animationsEnabled: z.boolean().default(true),
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  }).default({}),
  statistics: z.object({
    totalGames: z.number().min(0).default(0),
    gamesWon: z.number().min(0).default(0),
    gamesLost: z.number().min(0).default(0),
    gamesDrawn: z.number().min(0).default(0),
    totalMoves: z.number().min(0).default(0),
    averageMovesPerGame: z.number().min(0).default(0),
    bestScore: z.number().min(0).default(0),
    longestGame: z.number().min(0).default(0),
    lastPlayed: z.date().optional(),
  }).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * User document interface
 */
export interface UserDocument extends z.infer<typeof UserDocumentSchema> {
  _id?: ObjectId;
}

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

/**
 * Create game request schema
 */
export const CreateGameRequestSchema = z.object({
  gameMode: GameModeSchema,
  difficulty: z.number().min(1).max(5),
  userPlayer: PlayerSchema.nullable(),
  ai1Difficulty: z.number().min(1).max(5).optional(),
  ai2Difficulty: z.number().min(1).max(5).optional(),
});

/**
 * Add move request schema
 */
export const AddMoveRequestSchema = z.object({
  player: PlayerSchema,
  row: z.number().min(0).max(7),
  col: z.number().min(0).max(7),
  boardStateBefore: z.string().length(64),
  boardStateAfter: z.string().length(64),
  tilesFlipped: TilesFlippedSchema,
});

/**
 * Update game state request schema
 */
export const UpdateGameStateRequestSchema = z.object({
  currentPlayer: PlayerSchema.optional(),
  gameState: GameStateSchema.optional(),
  finalScore: ScoreSchema.optional(),
  winner: WinnerSchema.optional(),
  isActive: z.boolean().optional(),
});

/**
 * Game response schema
 */
export const GameResponseSchema = z.object({
  gameId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  gameMode: GameModeSchema,
  difficulty: z.number(),
  ai1Difficulty: z.number().optional(),
  ai2Difficulty: z.number().optional(),
  userPlayer: PlayerSchema.nullable(),
  currentPlayer: PlayerSchema,
  gameState: GameStateSchema,
  finalScore: ScoreSchema.optional(),
  winner: WinnerSchema.optional(),
  isActive: z.boolean(),
  totalMoves: z.number(),
  initialBoardState: z.string(),
});

/**
 * Move response schema
 */
export const MoveResponseSchema = z.object({
  moveId: z.string(),
  gameId: z.string(),
  moveNumber: z.number(),
  player: PlayerSchema,
  row: z.number(),
  col: z.number(),
  boardStateBefore: z.string(),
  boardStateAfter: z.string(),
  tilesFlipped: TilesFlippedSchema,
  timestamp: z.string(),
  isValidMove: z.boolean(),
});

/**
 * Game state response schema
 */
export const GameStateResponseSchema = z.object({
  gameId: z.string(),
  moveNumber: z.number(),
  boardState: z.string(),
  currentPlayer: PlayerSchema,
  gameState: GameStateSchema,
  score: ScoreSchema,
  validMoves: z.array(MoveSchema),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique game ID
 * @returns Unique game identifier
 */
export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate board state
 * @param board Board state to validate
 * @returns True if valid board state
 */
export function isValidBoardState(board: BoardState): boolean {
  if (!Array.isArray(board) || board.length !== 8) {
    return false;
  }
  
  for (let row = 0; row < 8; row++) {
    if (!Array.isArray(board[row]) || board[row].length !== 8) {
      return false;
    }
    
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (cell !== 'empty' && cell !== 'black' && cell !== 'white') {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Calculate game statistics from move history
 * @param moves Array of move documents
 * @returns Game statistics
 */
export function calculateGameStats(moves: MoveDocument[]): {
  totalMoves: number;
  blackMoves: number;
  whiteMoves: number;
  averageMovesPerPlayer: number;
  gameDuration: number; // in milliseconds
} {
  const totalMoves = moves.length;
  const blackMoves = moves.filter(move => move.player === 'black').length;
  const whiteMoves = moves.filter(move => move.player === 'white').length;
  
  let gameDuration = 0;
  if (moves.length > 0) {
    const firstMove = moves[0];
    const lastMove = moves[moves.length - 1];
    gameDuration = lastMove.timestamp.getTime() - firstMove.timestamp.getTime();
  }
  
  return {
    totalMoves,
    blackMoves,
    whiteMoves,
    averageMovesPerPlayer: totalMoves / 2,
    gameDuration,
  };
}

// Export all schemas and types
export type {
  MoveDocument,
  GameDocument,
  UserDocument,
};

export {
  MoveDocumentSchema,
  GameDocumentSchema,
  UserDocumentSchema,
  CreateGameRequestSchema,
  AddMoveRequestSchema,
  UpdateGameStateRequestSchema,
  GameResponseSchema,
  MoveResponseSchema,
  GameStateResponseSchema,
  compressBoardState,
  decompressBoardState,
  createMoveDocument,
  createGameDocument,
  generateGameId,
  isValidBoardState,
  calculateGameStats,
};
