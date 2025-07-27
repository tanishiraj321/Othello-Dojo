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
  suggestedMove: Move | null;
}

const GridLabel = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center text-sm font-bold text-muted-foreground">
        {label}
    </div>
)

export default function OthelloBoard({ board, onCellClick, validMoves, suggestedMove }: OthelloBoardProps) {
  const colLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return (
    <div className="w-full max-w-2xl mx-auto aspect-square">
        <div className="grid grid-cols-[auto_1fr] gap-2 h-full">
            {/* Row Labels */}
            <div className="grid grid-rows-8 gap-1">
                {Array.from({length: 8}, (_, i) => <GridLabel key={`row-${i}`} label={`${i + 1}`} />)}
            </div>
            <div className="grid grid-rows-[auto_1fr] gap-2 h-full">
                {/* Column Labels */}
                <div className="grid grid-cols-8 gap-1">
                    {colLabels.map(label => <GridLabel key={`col-${label}`} label={label} />)}
                </div>
                {/* Board */}
                <div className="w-full h-full bg-green-900 p-2 grid grid-cols-8 gap-1 rounded-lg shadow-2xl">
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                    const isMoveValid = validMoves.some(m => m.row === rowIndex && m.col === colIndex);
                    const isSuggestedMove = suggestedMove && suggestedMove.row === rowIndex && suggestedMove.col === colIndex;
                    return (
                        <div
                        key={`${rowIndex}-${colIndex}`}
                        className={cn(
                            "aspect-square bg-green-800 flex items-center justify-center p-1 rounded-sm relative",
                            isMoveValid ? "cursor-pointer hover:bg-green-700 transition-colors" : ""
                        )}
                        onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                        >
                        {isSuggestedMove && (
                          <div className="absolute inset-0 bg-red-500/50 rounded-full animate-pulse" />
                        )}
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
            </div>
        </div>
    </div>
  );
}
