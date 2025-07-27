import type { BoardState, CellState, Player } from '@/types/othello';

const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1], [1, 0], [1, 1],
];

export function createInitialBoard(): BoardState {
  const board: BoardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('empty'));
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
}

export const getOpponent = (player: Player): Player => (player === 'black' ? 'white' : 'black');

function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getFlipsForMove(board: BoardState, player: Player, row: number, col: number): {row: number, col: number}[] {
    if (board[row][col] !== 'empty') {
      return [];
    }
  
    const opponent = getOpponent(player);
    const tilesToFlip: {row: number, col: number}[] = [];
  
    for (const [dr, dc] of DIRECTIONS) {
      let r = row + dr;
      let c = col + dc;
      const potentialFlips: {row: number, col: number}[] = [];
  
      while (isInsideBoard(r, c) && board[r][c] === opponent) {
        potentialFlips.push({ row: r, col: c });
        r += dr;
        c += dc;
      }
  
      if (isInsideBoard(r, c) && board[r][c] === player) {
        tilesToFlip.push(...potentialFlips);
      }
    }
  
    return tilesToFlip;
}

export function isValidMove(board: BoardState, player: Player, row: number, col: number): boolean {
    return getFlipsForMove(board, player, row, col).length > 0;
}


export function getValidMoves(board: BoardState, player: Player): {row: number, col: number}[] {
  const validMoves: {row: number, col: number}[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, player, r, c)) {
        validMoves.push({ row: r, col: c });
      }
    }
  }
  return validMoves;
}

export function applyMove(board: BoardState, player: Player, row: number, col: number): BoardState {
  const newBoard = board.map(r => [...r]) as BoardState;
  const tilesToFlip = getFlipsForMove(board, player, row, col);

  if (tilesToFlip.length === 0 && board[row][col] === 'empty') return board;

  newBoard[row][col] = player;
  tilesToFlip.forEach(tile => {
    newBoard[tile.row][tile.col] = player;
  });

  return newBoard;
}

export function getScore(board: BoardState): { black: number; white: number } {
  let black = 0;
  let white = 0;
  board.forEach(row => {
    row.forEach(cell => {
      if (cell === 'black') black++;
      if (cell === 'white') white++;
    });
  });
  return { black, white };
}

export function boardToString(board: BoardState): string {
  return board.map(row => 
    row.map(cell => {
      if (cell === 'black') return 'B';
      if (cell === 'white') return 'W';
      return '_';
    }).join('')
  ).join('\n');
}
