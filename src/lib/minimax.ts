import type { BoardState, Player, Move } from '@/types/othello';
import { getValidMoves, applyMove, getOpponent, getScore } from './othello';

function evaluateBoard(board: BoardState, player: Player): number {
  const score = getScore(board);
  const opponent = getOpponent(player);
  return score[player] - score[opponent];
}

export function minimax(
  board: BoardState,
  depth: number,
  isMaximizingPlayer: boolean,
  player: Player,
  alpha = -Infinity,
  beta = Infinity
): { score: number; move: Move | null } {
  if (depth === 0) {
    return { score: evaluateBoard(board, player), move: null };
  }

  const moves = getValidMoves(board, isMaximizingPlayer ? player : getOpponent(player));
  if (moves.length === 0) {
    return { score: evaluateBoard(board, player), move: null };
  }

  let bestMove: Move | null = moves[0];
  let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = applyMove(board, isMaximizingPlayer ? player : getOpponent(player), move.row, move.col);
    const { score } = minimax(newBoard, depth - 1, !isMaximizingPlayer, player, alpha, beta);

    if (isMaximizingPlayer) {
      if (score > bestValue) {
        bestValue = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestValue);
    } else {
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
