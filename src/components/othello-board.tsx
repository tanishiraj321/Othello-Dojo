
'use client';

import type { BoardState, Player, Move } from '@/types/othello';
import { cn } from '@/lib/utils';
import React from 'react';

interface PieceProps {
  color: 'black' | 'white';
  isFlipping: boolean;
}

const Piece = React.memo(({ color, isFlipping }: PieceProps) => {
    // If the piece is white, we want it to start rotated 180deg so the white face shows.
    // The flip animation will then rotate it to 360deg (which looks like 0), revealing the black face.
    const initialRotation = color === 'white' ? 180 : 0;
    const targetRotation = initialRotation + 180;
    
    return (
        <div 
            className={cn("relative w-full h-full duration-500")} 
            style={{ 
                transformStyle: 'preserve-3d', 
                transform: `rotateY(${isFlipping ? targetRotation : initialRotation}deg)` 
            }}
        >
            <div className="absolute w-full h-full rounded-full bg-black shadow-inner" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }} />
            <div className="absolute w-full h-full rounded-full bg-white shadow-inner" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} />
        </div>
    );
});
Piece.displayName = 'Piece';


interface OthelloBoardProps {
  board: BoardState;
  onCellClick: (move: Move) => void;
  validMoves: Move[];
  player: Player | null;
  suggestedMove: Move | null;
  lastMove: Move | null;
  flippingPieces: Move[];
}

const GridLabel = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center text-sm font-bold text-muted-foreground">
        {label}
    </div>
)

export default function OthelloBoard({ board, onCellClick, validMoves, suggestedMove, lastMove, flippingPieces }: OthelloBoardProps) {
  const rowLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return (
    <div className="w-full max-w-2xl mx-auto aspect-square">
        <div className="grid grid-cols-[auto_1fr] gap-2 h-full">
            {/* Row Labels */}
            <div className="grid grid-rows-8 gap-1">
                {rowLabels.map((label) => <GridLabel key={`row-${label}`} label={label} />)}
            </div>
            <div className="grid grid-rows-[auto_1fr] gap-2 h-full">
                {/* Column Labels */}
                <div className="grid grid-cols-8 gap-1">
                    {Array.from({length: 8}, (_, i) => <GridLabel key={`col-${i}`} label={`${i + 1}`} />)}
                </div>
                {/* Board */}
                <div className="w-full h-full bg-green-900 p-2 grid grid-cols-8 gap-1 rounded-lg shadow-2xl">
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                    const isMoveValid = validMoves.some(m => m.row === rowIndex && m.col === colIndex);
                    const isSuggestedMove = suggestedMove && suggestedMove.row === rowIndex && suggestedMove.col === colIndex;
                    const isLastMove = lastMove && lastMove.row === rowIndex && lastMove.col === colIndex;
                    const isFlipping = flippingPieces.some(p => p.row === rowIndex && p.col === colIndex);
                    return (
                        <div
                        key={`${rowIndex}-${colIndex}`}
                        className={cn(
                            "aspect-square bg-green-800 flex items-center justify-center p-1 rounded-sm relative",
                            isMoveValid ? "cursor-pointer hover:bg-green-700 transition-colors" : ""
                        )}
                        onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                        >
                        <div className="relative w-full h-full flex items-center justify-center" style={{perspective: '1000px'}}>
                            {cell !== 'empty' && (
                                <Piece color={cell} isFlipping={isFlipping} />
                            )}
                            {cell === 'empty' && isMoveValid && (
                                <div className="w-1/3 h-1/3 bg-primary/50 rounded-full" />
                            )}
                            {isSuggestedMove && (
                                <div className="absolute inset-0 bg-red-500/50 rounded-full animate-pulse" />
                            )}
                            {isLastMove && (
                                <div className="absolute w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_8px_theme(colors.blue.400)]" />
                            )}
                        </div>
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
