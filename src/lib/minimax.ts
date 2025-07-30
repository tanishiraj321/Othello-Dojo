import type { BoardState, Player, Move } from '@/types/othello';
import { getValidMoves, applyMove, getOpponent, getScore } from './othello';

// An improved evaluation function that considers piece difference, corners, mobility and edge control.
function evaluateBoard(board: BoardState, player: Player): number {
  const score = getScore(board);
  const opponent = getOpponent(player);
  
  // 1. Piece Difference (Heuristic)
  const pieceDifference = score[player] - score[opponent];

  // 2. Corner Control (Heuristic)
  const corners = [
    [0, 0], [0, 7], [7, 0], [7, 7]
  ];
  let cornerBonus = 0;
  const cornerWeight = 25;
  corners.forEach(([r, c]) => {
    if (board[r][c] === player) {
        cornerBonus += cornerWeight;
    } else if (board[r][c] === opponent) {
        cornerBonus -= cornerWeight;
    }
  });

  // 3. Mobility (Heuristic) - Number of available moves
  const playerMoves = getValidMoves(board, player).length;
  const opponentMoves = getValidMoves(board, opponent).length;
  const mobility = playerMoves - opponentMoves;
  const mobilityWeight = 5;

  // 4. Edge Control (Heuristic)
  let edgeBonus = 0;
  const edgeWeight = 5;
  for (let i = 1; i < 7; i++) {
    // Top and bottom edges
    if (board[0][i] === player) edgeBonus += edgeWeight;
    if (board[7][i] === player) edgeBonus += edgeWeight;
    // Left and right edges
    if (board[i][0] === player) edgeBonus += edgeWeight;
    if (board[i][7] === player) edgeBonus += edgeWeight;

    if (board[0][i] === opponent) edgeBonus -= edgeWeight;
    if (board[7][i] === opponent) edgeBonus -= edgeWeight;
    if (board[i][0] === opponent) edgeBonus -= edgeWeight;
    if (board[i][7] === opponent) edgeBonus -= edgeWeight;
  }

  // Combine heuristics into a final score
  const finalScore = pieceDifference + cornerBonus + (mobility * mobilityWeight) + edgeBonus;

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
