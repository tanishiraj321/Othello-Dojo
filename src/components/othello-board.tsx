'use client';

import type { BoardState, Player, Move } from '@/types/othello';
import { cn } from '@/lib/utils';

const BlackPiece = () => (
  <div className="w-full h-full rounded-full bg-black shadow-inner" />
);

const WhitePiece = () => (
  <div className="w-full h-full rounded-full bg-white shadow-inner" />
);

interface OthelloBoardProps {
  board: BoardState;
  onCellClick: (move: Move) => void;
  validMoves: Move[];
  player: Player;
}

export default function OthelloBoard({ board, onCellClick, validMoves }: OthelloBoardProps) {
  return (
    <div className="aspect-square w-full max-w-2xl mx-auto bg-green-900 p-2 grid grid-cols-8 gap-1 rounded-lg shadow-2xl">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isMoveValid = validMoves.some(m => m.row === rowIndex && m.col === colIndex);
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "aspect-square bg-green-800 flex items-center justify-center p-1 rounded-sm",
                isMoveValid ? "cursor-pointer hover:bg-green-700 transition-colors" : ""
              )}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
            >
              {cell === 'black' && <BlackPiece />}
              {cell === 'white' && <WhitePiece />}
              {cell === 'empty' && isMoveValid && (
                <div className="w-1/3 h-1/3 bg-primary/50 rounded-full" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
