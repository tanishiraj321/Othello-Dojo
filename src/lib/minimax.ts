import type { BoardState, Player, Move } from '@/types/othello';
import { getValidMoves, applyMove, getOpponent, getScore } from './othello';

// An improved evaluation function that considers piece difference and corners.
function evaluateBoard(board: BoardState, player: Player): number {
  const score = getScore(board);
  const opponent = getOpponent(player);
  
  // Base score is the difference in pieces
  let finalScore = score[player] - score[opponent];

  // Add a significant bonus for controlling corners
  const corners = [
    board[0][0],
    board[0][7],
    board[7][0],
    board[7][7],
  ];

  const cornerBonus = 25;

  corners.forEach(corner => {
    if (corner === player) {
        finalScore += cornerBonus;
    } else if (corner === opponent) {
        finalScore -= cornerBonus;
    }
  });

  return finalScore;
}

export function minimax(
  board: BoardState,
  depth: number,
  isMaximizingPlayer: boolean,
  player: Player, // The AI player, not the current player in recursion
  alpha = -Infinity,
  beta = Infinity
): { score: number; move: Move | null } {
  const currentPlayer = isMaximizingPlayer ? player : getOpponent(player);
  const moves = getValidMoves(board, currentPlayer);

  // Base case: if depth is 0 or no valid moves, return board evaluation
  if (depth === 0 || moves.length === 0) {
    return { score: evaluateBoard(board, player), move: null };
  }

  let bestMove: Move | null = moves[0];
  let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = applyMove(board, currentPlayer, move.row, move.col);
    // The next level of the tree is for the other player
    const { score } = minimax(newBoard, depth - 1, !isMaximizingPlayer, player, alpha, beta);

    if (isMaximizingPlayer) {
      if (score > bestValue) {
        bestValue = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestValue);
    } else { // Minimizing player
      if (score < bestValue) {
        bestValue = score;
        bestMove = move;
      }
      beta = Math.min(beta, bestValue);
    }

    if (beta <= alpha) {
      break; // Alpha-beta pruning
    }
  }

  return { score: bestValue, move: bestMove };
}
