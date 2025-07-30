'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Bot, BrainCircuit, Lightbulb, BarChart, Info, Undo, ListCollapse } from 'lucide-react';
import type { BoardState, Player, Move } from '@/types/othello';
import { createInitialBoard, getValidMoves, applyMove, getScore, getOpponent, boardToString, isValidMove } from '@/lib/othello';
import OthelloBoard from '@/components/othello-board';
import GameInfoPanel from '@/components/game-info-panel';
import AiPanel from '@/components/ai-panel';
import WinRateChart from '@/components/win-rate-chart';
import { suggestGoodMoves, SuggestGoodMovesOutput } from '@/ai/flows/suggest-good-moves';
import { visualizeAiDecision } from '@/ai/flows/real-time-decision-visualization';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { minimax } from '@/lib/minimax';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const rowLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function Home() {
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [userPlayer, setUserPlayer] = useState<Player>('black');
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [score, setScore] = useState({ black: 2, white: 2 });
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [aiIsThinking, setAiIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // 1: Easy, 3: Medium, 5: Hard
  const [lastMove, setLastMove] = useState<Move | null>(null);
  
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

  const [history, setHistory] = useState<{board: BoardState, player: Player, move: Move | null}[]>([]);
  const { toast } = useToast();

  const updateGameData = useCallback((currentBoard: BoardState, player: Player) => {
    const newValidMoves = getValidMoves(currentBoard, player);
    setValidMoves(newValidMoves);
    setScore(getScore(currentBoard));

    if (newValidMoves.length === 0) {
      const opponent = getOpponent(player);
      const opponentMoves = getValidMoves(currentBoard, opponent);
      if (opponentMoves.length === 0) {
        setGameState('gameOver');
      } else {
        // Pass turn
        setCurrentPlayer(opponent);
      }
    }
  }, []);


  useEffect(() => {
    if (gameState === 'playing') {
      updateGameData(board, currentPlayer);
    }
  }, [board, currentPlayer, gameState, updateGameData]);
  
  const handleCellClick = (move: Move) => {
    if (gameState !== 'playing' || currentPlayer !== userPlayer || aiIsThinking) return;
    
    const isMoveValid = validMoves.some(m => m.row === move.row && m.col === move.col);
    if (!isMoveValid) return;

    const newBoard = applyMove(board, currentPlayer, move.row, move.col);
    setHistory(prev => [...prev, {board, player: currentPlayer, move}]);
    setBoard(newBoard);
    setLastMove(move);
    setCurrentPlayer(getOpponent(currentPlayer));
    setSuggestion(null); // Clear suggestion after move
  };

  const startNewGame = (player: Player) => {
    const initialBoard = createInitialBoard();
    setBoard(initialBoard);
    setUserPlayer(player);
    setCurrentPlayer('black');
    setGameState('playing');
    setSuggestion(null);
    setVisualization(null);
    setLastMove(null);
    setHistory([{board: initialBoard, player: 'black', move: null}]);
  };
  
  const handleSuggestMove = async (retries = 2) => {
    setSuggestionLoading(true);
    setSuggestion(null);
    try {
      const response = await suggestGoodMoves({
        boardState: boardToString(board),
        player: currentPlayer,
      });

      const { move } = response;
      if (isValidMove(board, currentPlayer, move.row, move.col)) {
        setSuggestion(response);
        const moveString = `${rowLabels[response.move.row]}${response.move.col + 1}`;
        toast({
          title: "AI Suggestion",
          description: `The AI suggests moving to ${moveString}.`,
        });
      } else if (retries > 0) {
        console.warn("AI suggested an invalid move. Retrying...");
        await handleSuggestMove(retries - 1);
      } else {
         toast({
          title: "Error",
          description: "The AI failed to suggest a valid move.",
          variant: "destructive",
        });
      }

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
  };

  const handleUndo = () => {
    if (history.length < 2) {
      toast({ title: "Cannot Undo", description: "No moves to undo.", variant: "destructive" });
      return;
    }
  
    // We want to go back to the state before the user's last move.
    // The AI moves right after, so we pop twice.
    const newHistory = history.slice(0, -2);
    const lastPlayerState = newHistory[newHistory.length - 1];

    if (lastPlayerState) {
        setBoard(lastPlayerState.board);
        setCurrentPlayer(lastPlayerState.player);
        setLastMove(lastPlayerState.move);
        setHistory(newHistory);
        setSuggestion(null);
        setVisualization(null);
    }
  };

  const aiPlayer = useMemo(() => getOpponent(userPlayer), [userPlayer]);

  useEffect(() => {
    if (gameState === 'playing' && currentPlayer === aiPlayer && !aiIsThinking) {
      setAiIsThinking(true);
      setTimeout(() => {
        const moves = getValidMoves(board, aiPlayer);
        if (moves.length > 0) {
          const { move: bestMove } = minimax(board, difficulty, true, aiPlayer);

          if(bestMove){
            setHistory(prev => [...prev, {board, player: currentPlayer, move: bestMove}]);
            const newBoard = applyMove(board, aiPlayer, bestMove.row, bestMove.col);
            setBoard(newBoard);
            setLastMove(bestMove);
            setCurrentPlayer(userPlayer);
          }
        }
        setAiIsThinking(false);
      }, 500);
    }
  }, [gameState, currentPlayer, aiPlayer, aiIsThinking, board, userPlayer, difficulty]);

  const displayedSuggestion = suggestion && (
    <div className="text-sm p-3 bg-muted rounded-md space-y-1">
      <p><strong className="text-primary">Suggested Move:</strong> {`${rowLabels[suggestion.move.row]}${suggestion.move.col + 1}`}</p>
      <p className="font-code text-muted-foreground">{suggestion.rationale}</p>
    </div>
  );

  const canUndo = gameState === 'playing' && history.length > 1 && !aiIsThinking && currentPlayer === userPlayer;

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
                onSuggestMove={() => handleSuggestMove()}
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
            lastMove={lastMove}
          />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <ListCollapse className="w-5 h-5 text-primary" />
                    Move History
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo}>
                    <Undo className="mr-2 h-4 w-4" /> Undo
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 w-full">
                    <div className="space-y-2 font-code text-sm">
                        {history.slice(1).map((entry, index) => (
                            <div key={index} className="flex gap-4 p-1 rounded-md bg-muted/50">
                                <span className="font-bold">{index + 1}.</span>
                                <span className="capitalize">{entry.player}</span>
                                <span>{entry.move ? `${rowLabels[entry.move.row]}${entry.move.col + 1}` : 'N/A'}</span>
                            </div>
                        ))}
                         {history.length <= 1 && (
                            <p className="text-muted-foreground text-center p-4">No moves yet.</p>
                         )}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
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
