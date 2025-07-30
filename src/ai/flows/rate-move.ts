'use server';
/**
 * @fileOverview A Genkit flow for rating a player's move in Othello.
 *
 * - rateMove - A function that takes the board state before and after a move and provides an AI-powered rating.
 * - RateMoveInput - The input type for the rateMove function.
 * - RateMoveOutput - The return type for the rateMove function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { BoardState, Player } from '@/types/othello';
import { minimax } from '@/lib/minimax';
import { getValidMoves, getScore, getOpponent } from '@/lib/othello';


const RateMoveInputSchema = z.object({
  boardBefore: z.any().describe("The Othello board state before the player's move."),
  player: z.string().describe("The player who made the move ('black' or 'white')."),
  difficulty: z.number().describe("The AI difficulty to use for evaluation."),
});
export type RateMoveInput = z.infer<typeof RateMoveInputSchema>;

const RateMoveOutputSchema = z.object({
  rating: z.number().min(0).max(5).describe('The star rating of the move, from 0 to 5.'),
  analysis: z.string().describe('A brief analysis of the move.'),
});
export type RateMoveOutput = z.infer<typeof RateMoveOutputSchema>;


export async function rateMove(input: RateMoveInput): Promise<RateMoveOutput> {
  return rateMoveFlow(input);
}

const rateMoveFlow = ai.defineFlow(
  {
    name: 'rateMoveFlow',
    inputSchema: RateMoveInputSchema,
    outputSchema: RateMoveOutputSchema,
  },
  async (input) => {
    const { boardBefore, player, difficulty } = input;
    const board = boardBefore as BoardState;
    const currentPlayer = player as Player;

    const validMoves = getValidMoves(board, currentPlayer);
    if (validMoves.length === 0) {
      return { rating: 0, analysis: "No moves were available." };
    }
    
    // Use minimax to find the best possible move and its score
    const { score: bestScore } = minimax(board, difficulty, true, currentPlayer);
    
    // Evaluate all possible moves to find the range of outcomes
    const moveScores = validMoves.map(move => {
        const tempBoard = applyMove(board, currentPlayer, move.row, move.col);
        const { score } = minimax(tempBoard, difficulty > 1 ? difficulty - 1 : 1, false, getOpponent(currentPlayer));
        return score;
    });

    const worstScore = Math.min(...moveScores);
    
    // Evaluate the score of the board *after* the player's move, from the perspective of the opponent.
    const tempBoardAfterPlayerMove = applyMove(board, currentPlayer, (input as any).move.row, (input as any).move.col);
    const evaluationOfPlayerMove = minimax(tempBoardAfterPlayerMove, difficulty > 1 ? difficulty - 1 : 1, false, getOpponent(currentPlayer)).score;


    // Normalize the player's move score to a 0-1 range
    let normalizedScore = 0;
    if (bestScore > worstScore) {
      normalizedScore = (evaluationOfPlayerMove - worstScore) / (bestScore - worstScore);
    } else if (bestScore === worstScore) {
       normalizedScore = 1; // Only one move was possible, so it must be the best.
    }
    
    // Convert to a 5-star rating
    const rating = Math.round(normalizedScore * 4) + 1; // Scale 0-1 to 1-5

    let analysis = "";
    if (rating >= 5) {
        analysis = "Excellent! You found the optimal move.";
    } else if (rating >= 4) {
        analysis = "Great move! Very strong play.";
    } else if (rating >= 3) {
        analysis = "Good move, but there might have been a slightly better option.";
    } else if (rating >= 2) {
        analysis = "A decent move, but it has some drawbacks.";
    } else {
        analysis = "This move might be a mistake. Look for stronger alternatives.";
    }

    return { rating: Math.max(1, Math.min(5, rating)), analysis };
  }
);

function applyMove(board: BoardState, player: Player, row: number, col: number): BoardState {
  const newBoard = board.map(r => [...r]);
  const opponent = getOpponent(player);
  const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  if (row < 0 || row >= 8 || col < 0 || col >= 8 || newBoard[row][col] !== 'empty') {
      return board;
  }

  let tilesToFlip = [];
  newBoard[row][col] = player;

  for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      let line = [];

      while(r >= 0 && r < 8 && c >= 0 && c < 8 && newBoard[r][c] === opponent) {
          line.push([r, c]);
          r += dr;
          c += dc;
      }
      if (r >= 0 && r < 8 && c >= 0 && c < 8 && newBoard[r][c] === player) {
          tilesToFlip.push(...line);
      }
  }

  for (const [r, c] of tilesToFlip) {
      newBoard[r][c] = player;
  }
  return newBoard as BoardState;
}
