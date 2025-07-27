'use client';

import type { Player } from '@/types/othello';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Cpu } from 'lucide-react';

interface GameInfoPanelProps {
  gameState: 'menu' | 'playing' | 'gameOver';
  currentPlayer: Player;
  score: { black: number; white: number };
  onStartGame: (player: Player) => void;
  userPlayer: Player;
  aiIsThinking: boolean;
}

export default function GameInfoPanel({
  gameState,
  currentPlayer,
  score,
  onStartGame,
  userPlayer,
  aiIsThinking
}: GameInfoPanelProps) {
    const renderGameState = () => {
        if (gameState === 'gameOver') {
            const winner = score.black > score.white ? 'Black' : score.white > score.black ? 'White' : 'Draw';
            return (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-primary">Game Over</h3>
                    <p>{winner === 'Draw' ? "It's a draw!" : `${winner} wins!`}</p>
                </div>
            )
        }
        if (gameState === 'playing') {
            const isUserTurn = currentPlayer === userPlayer;
            return (
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                        {isUserTurn ? "Your Turn" : "AI's Turn"}
                    </h3>
                    <div className={cn(
                        "flex items-center justify-center gap-2 p-2 rounded-md transition-all",
                        currentPlayer === 'black' ? 'bg-black text-white' : 'bg-white text-black'
                    )}>
                        <p className="font-bold text-lg capitalize">{currentPlayer}</p>
                        {aiIsThinking && <Cpu className="animate-spin" />}
                    </div>
                </div>
            );
        }
        return null;
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Game Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameState !== 'menu' && (
             <div className="flex justify-around text-center text-xl font-bold">
             <div>
               <p className="flex items-center gap-2"><User /> Black</p>
               <p>{score.black}</p>
             </div>
             <div>
               <p className="flex items-center gap-2"><Cpu /> White</p>
               <p>{score.white}</p>
             </div>
           </div>
        )}
       
        {renderGameState()}

        { (gameState === 'menu' || gameState === 'gameOver') && (
            <div className="space-y-2 pt-4">
                 <p className="text-center text-muted-foreground">Start a new game as:</p>
                 <div className="flex gap-2">
                    <Button className="w-full" onClick={() => onStartGame('black')}>Black</Button>
                    <Button className="w-full" variant="secondary" onClick={() => onStartGame('white')}>White</Button>
                 </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
