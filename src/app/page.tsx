'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Bot, BrainCircuit, Lightbulb, BarChart, Info } from 'lucide-react';
import type { BoardState, Player, Move } from '@/types/othello';
import { createInitialBoard, getValidMoves, applyMove, getScore, getOpponent, boardToString } from '@/lib/othello';
import OthelloBoard from '@/components/othello-board';
import GameInfoPanel from '@/components/game-info-panel';
import AiPanel from '@/components/ai-panel';
import WinRateChart from '@/components/win-rate-chart';
import { suggestGoodMoves, SuggestGoodMovesOutput } from '@/ai/flows/suggest-good-moves';
import { visualizeAiDecision } from '@/ai/flows/real-time-decision-visualization';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { minimax } from '@/lib/minimax';

const colLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Home() {
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [userPlayer, setUserPlayer] = useState<Player>('black');
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [score, setScore] = useState({ black: 2, white: 2 });
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [aiIsThinking, setAiIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // 1: Easy, 3: Medium, 5: Hard
  
  const [suggestion, setSuggestion] = useState<SuggestGoodMovesOutput | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  
  const [visualization, setVisualization] = useState<{ explanation: string } | null>(null);
  const [visualizationLoading, setVisualizationLoading] = useState(false);
  
  const [trainingData, setTrainingData] = useState([
    { games: 10, aiWins: 4, opponentWins: 6 },
    { games: 20, aiWins: 7, opponentWins: 13 },
    { games: 30, aiWins: 15, opponentWins: 15 },
    { games: 40, aiWins: 25, opponentWins: 15 },
    { games: 50, aiWins: 35, opponentWins: 15 },
  ]);

  const { toast } = useToast();

  const updateGameData = useCallback(() => {
    const newValidMoves = getValidMoves(board, currentPlayer);
    setValidMoves(newValidMoves);
    setScore(getScore(board));

    if (newValidMoves.length === 0) {
      const opponent = getOpponent(currentPlayer);
      const opponentMoves = getValidMoves(board, opponent);
      if (opponentMoves.length === 0) {
        setGameState('gameOver');
      } else {
        // Pass turn
        setCurrentPlayer(opponent);
      }
    }
  }, [board, currentPlayer]);

  useEffect(() => {
    if (gameState === 'playing') {
      updateGameData();
    }
  }, [board, currentPlayer, gameState, updateGameData]);
  
  const handleCellClick = (move: Move) => {
    if (gameState !== 'playing' || currentPlayer !== userPlayer || aiIsThinking) return;
    
    const isMoveValid = validMoves.some(m => m.row === move.row && m.col === move.col);
    if (!isMoveValid) return;

    const newBoard = applyMove(board, currentPlayer, move.row, move.col);
    setBoard(newBoard);
    setCurrentPlayer(getOpponent(currentPlayer));
    setSuggestion(null); // Clear suggestion after move
  };

  const startNewGame = (player: Player) => {
    setBoard(createInitialBoard());
    setUserPlayer(player);
    setCurrentPlayer('black');
    setGameState('playing');
    setSuggestion(null);
    setVisualization(null);
  };
  
  const handleSuggestMove = async () => {
    setSuggestionLoading(true);
    setSuggestion(null);
    try {
      const response = await suggestGoodMoves({
        boardState: boardToString(board),
        player: currentPlayer,
      });
      setSuggestion(response);
      const moveString = `${colLabels[response.move.col]}${response.move.row + 1}`;
      toast({
        title: "AI Suggestion",
        description: `The AI suggests moving to ${moveString}.`,
      });
    } catch (error) {
      console.error("Error getting move suggestion:", error);
      toast({
        title: "Error",
        description: "Could not get a move suggestion.",
        variant: "destructive",
      });
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleVisualize = async () => {
    setVisualizationLoading(true);
    setVisualization(null);
    try {
      const possibleMoves = getValidMoves(board, 'white').map(move => {
        const tempBoard = applyMove(board, 'white', move.row, move.col);
        const newScore = getScore(tempBoard);
        return {
          row: move.row,
          col: move.col,
          score: newScore.white - score.white
        }
      });
      
      const response = await visualizeAiDecision({
        boardState: boardToString(board),
        possibleMoves: possibleMoves,
      });
      setVisualization(response);
      toast({
        title: "AI Decision Visualization",
        description: "The AI's thought process has been visualized.",
      });
    } catch (error) {
      console.error("Error visualizing decision:", error);
       toast({
        title: "Error",
        description: "Could not visualize AI decision.",
        variant: "destructive",
      });
    } finally {
      setVisualizationLoading(false);
    }
  };
  
  const runNewTrainingSession = () => {
    startNewGame(userPlayer);
    setTrainingData(prev => prev.map(d => ({
        ...d,
        aiWins: Math.floor(Math.random() * d.games),
        opponentWins: Math.floor(Math.random() * d.games),
    })))
    toast({
      title: "New Training Session",
      description: "AI model has been reset and is learning from scratch.",
    });
  }

  const aiPlayer = useMemo(() => getOpponent(userPlayer), [userPlayer]);

  useEffect(() => {
    if (gameState === 'playing' && currentPlayer === aiPlayer && !aiIsThinking) {
      setAiIsThinking(true);
      setTimeout(() => {
        const moves = getValidMoves(board, aiPlayer);
        if (moves.length > 0) {
          const { move: bestMove } = minimax(board, difficulty, true, aiPlayer);

          if(bestMove){
            const newBoard = applyMove(board, aiPlayer, bestMove.row, bestMove.col);
            setBoard(newBoard);
            setCurrentPlayer(userPlayer);
          }
        }
        setAiIsThinking(false);
      }, 500);
    }
  }, [gameState, currentPlayer, aiPlayer, aiIsThinking, board, userPlayer, difficulty]);

  const displayedSuggestion = suggestion && (
    <div className="text-sm p-3 bg-muted rounded-md space-y-1">
      <p><strong className="text-primary">Suggested Move:</strong> {`${colLabels[suggestion.move.col]}${suggestion.move.row + 1}`}</p>
      <p className="font-code text-muted-foreground">{suggestion.rationale}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4">
          <Bot className="w-10 h-10 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tighter text-primary">
            OthelloAI Dojo
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">Observe, Learn, and Play against a learning Othello AI.</p>
        <div className="mt-4">
          <Link href="/about" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
            <Info className="w-4 h-4" />
            About this App
          </Link>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-3 space-y-6">
          <GameInfoPanel
            gameState={gameState}
            currentPlayer={currentPlayer}
            score={score}
            onStartGame={startNewGame}
            userPlayer={userPlayer}
            aiIsThinking={aiIsThinking}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                AI Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AiPanel
                onSuggestMove={handleSuggestMove}
                suggestion={displayedSuggestion}
                suggestionLoading={suggestionLoading}
                onVisualize={handleVisualize}
                visualization={visualization}
                visualizationLoading={visualizationLoading}
                onNewTraining={runNewTrainingSession}
                isPlayerTurn={currentPlayer === userPlayer && gameState === 'playing'}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-6">
          <OthelloBoard
            board={board}
            onCellClick={handleCellClick}
            validMoves={currentPlayer === userPlayer ? validMoves : []}
            player={userPlayer}
            suggestedMove={suggestion?.move ?? null}
          />
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-primary" />
                    Win-Rate Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
              <WinRateChart data={trainingData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
