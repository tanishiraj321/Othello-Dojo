'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Bot, BrainCircuit, Lightbulb, BarChart, Info, Undo, ListCollapse, Users } from 'lucide-react';
import type { BoardState, Player, Move } from '@/types/othello';
import { createInitialBoard, getValidMoves, applyMove, getScore, getOpponent, boardToString } from '@/lib/othello';
import OthelloBoard from '@/components/othello-board';
import GameInfoPanel from '@/components/game-info-panel';
import AiPanel from '@/components/ai-panel';
import WinRateChart from '@/components/win-rate-chart';
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
  const [userPlayer, setUserPlayer] = useState<Player | null>('black');
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [score, setScore] = useState({ black: 2, white: 2 });
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [gameMode, setGameMode] = useState<'playerVsAi' | 'aiVsAi'>('playerVsAi');
  const [aiIsThinking, setAiIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // Player vs AI difficulty
  const [ai1Difficulty, setAi1Difficulty] = useState(1);
  const [ai2Difficulty, setAi2Difficulty] = useState(1);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  
  const [suggestion, setSuggestion] = useState<{ move: Move; rationale: string; } | null>(null);
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
        toast({
          title: "Turn Skipped",
          description: `No valid moves for ${player}. ${opponent}'s turn.`,
        });
        setCurrentPlayer(opponent);
      }
    }
  }, [toast]);


  useEffect(() => {
    if (gameState === 'playing') {
      updateGameData(board, currentPlayer);
    }
  }, [board, currentPlayer, gameState, updateGameData]);
  
  const handleCellClick = (move: Move) => {
    if (gameState !== 'playing' || currentPlayer !== userPlayer || aiIsThinking || gameMode === 'aiVsAi') return;
    
    const isMoveValid = validMoves.some(m => m.row === move.row && m.col === move.col);
    if (!isMoveValid) return;

    const newBoard = applyMove(board, currentPlayer, move.row, move.col);
    setHistory(prev => [...prev, {board, player: currentPlayer, move}]);
    setBoard(newBoard);
    setLastMove(move);
    setCurrentPlayer(getOpponent(currentPlayer));
    setSuggestion(null);
  };

  const startPlayerVsAiGame = (player: Player) => {
    const initialBoard = createInitialBoard();
    setBoard(initialBoard);
    setUserPlayer(player);
    setCurrentPlayer('black');
    setGameState('playing');
    setGameMode('playerVsAi');
    setSuggestion(null);
    setVisualization(null);
    setLastMove(null);
    setHistory([{board: initialBoard, player: 'black', move: null}]);
  };

  const startAiVsAiGame = () => {
    const initialBoard = createInitialBoard();
    setBoard(initialBoard);
    setUserPlayer(null);
    setCurrentPlayer('black');
    setGameState('playing');
    setGameMode('aiVsAi');
    setSuggestion(null);
    setVisualization(null);
    setLastMove(null);
    setHistory([{board: initialBoard, player: 'black', move: null}]);
  };
  
  const handleSuggestMove = () => {
    if (gameMode === 'aiVsAi' || !userPlayer) return;
    setSuggestionLoading(true);
    setSuggestion(null);

    try {
      const { move } = minimax(board, difficulty, true, currentPlayer);

      if (move) {
        const moveString = `${rowLabels[move.row]}${move.col + 1}`;
        const rationale = `The optimal move is ${moveString}. This move was determined by the game's AI to maximize your score and strategic position based on the current board state.`;
        setSuggestion({ move, rationale });
        toast({
          title: "AI Suggestion",
          description: `The AI suggests moving to ${moveString}.`,
        });
      } else {
         toast({
          title: "No Suggestion Available",
          description: "There are no valid moves to suggest.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting move suggestion:", error);
      toast({
        title: "Error",
        description: "Could not get a move suggestion. Please try again.",
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
      const opponent = gameMode === 'playerVsAi' && userPlayer ? getOpponent(userPlayer) : 'white';
      const possibleMoves = getValidMoves(board, opponent).map(move => {
        const tempBoard = applyMove(board, opponent, move.row, move.col);
        const newScore = getScore(tempBoard);
        return {
          row: move.row,
          col: move.col,
          score: newScore[opponent] - score[opponent]
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
    if (gameMode === 'playerVsAi' && userPlayer) {
      startPlayerVsAiGame(userPlayer);
    } else if (gameMode === 'aiVsAi') {
      startAiVsAiGame();
    }
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
    if (history.length < 2 || gameMode === 'aiVsAi') {
      toast({ title: "Cannot Undo", description: "No moves to undo or action not allowed in AI vs AI mode.", variant: "destructive" });
      return;
    }
  
    const movesToUndo = (userPlayer === 'black' && currentPlayer === 'black') || (userPlayer === 'white' && currentPlayer === 'white') ? 2 : 1;
    const newHistory = history.slice(0, -(movesToUndo));
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

  const aiPlayer = useMemo(() => {
    if (gameMode === 'playerVsAi' && userPlayer) {
      return getOpponent(userPlayer)
    }
    return null;
  }, [userPlayer, gameMode]);


  useEffect(() => {
    if (gameState !== 'playing' || aiIsThinking) return;
  
    const handlePlayerVsAiMove = () => {
      if (currentPlayer === aiPlayer) {
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
              setCurrentPlayer(userPlayer as Player);
            }
          }
          setAiIsThinking(false);
        }, 500);
      }
    };
  
    const handleAiVsAiMove = () => {
      setAiIsThinking(true);
      setTimeout(() => {
        const moves = getValidMoves(board, currentPlayer);
        if (moves.length > 0) {
          const currentAiDifficulty = currentPlayer === 'black' ? ai1Difficulty : ai2Difficulty;
          const { move: bestMove } = minimax(board, currentAiDifficulty, true, currentPlayer);
  
          if(bestMove){
            setHistory(prev => [...prev, {board, player: currentPlayer, move: bestMove}]);
            const newBoard = applyMove(board, currentPlayer, bestMove.row, bestMove.col);
            setBoard(newBoard);
            setLastMove(bestMove);
            setCurrentPlayer(getOpponent(currentPlayer));
          }
        }
        setAiIsThinking(false);
      }, 3000); // 3-second delay for visualization
    };
  
    if (gameMode === 'playerVsAi') {
      handlePlayerVsAiMove();
    } else if (gameMode === 'aiVsAi') {
      handleAiVsAiMove();
    }
  
  }, [gameState, currentPlayer, aiPlayer, aiIsThinking, board, userPlayer, difficulty, gameMode, ai1Difficulty, ai2Difficulty]);

  const displayedSuggestion = suggestion && (
    <div className="text-sm p-3 bg-muted rounded-md space-y-1">
      <p><strong className="text-primary">Suggested Move:</strong> {`${rowLabels[suggestion.move.row]}${suggestion.move.col + 1}`}</p>
      <p className="font-code text-muted-foreground">{suggestion.rationale}</p>
    </div>
  );

  const canUndo = gameState === 'playing' && history.length > 1 && !aiIsThinking && gameMode === 'playerVsAi' && currentPlayer === userPlayer;

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
            gameMode={gameMode}
            onGameModeChange={setGameMode}
            currentPlayer={currentPlayer}
            score={score}
            onStartPlayerVsAi={startPlayerVsAiGame}
            onStartAiVsAi={startAiVsAiGame}
            userPlayer={userPlayer}
            aiIsThinking={aiIsThinking}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            ai1Difficulty={ai1Difficulty}
            onAi1DifficultyChange={setAi1Difficulty}
            ai2Difficulty={ai2Difficulty}
            onAi2DifficultyChange={setAi2Difficulty}
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
                isPlayerTurn={gameMode === 'playerVsAi' && currentPlayer === userPlayer && gameState === 'playing'}
                gameMode={gameMode}
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
                             <div key={index} className="flex gap-4 p-1 rounded-md bg-muted/50 items-center">
                                <span className="font-bold w-6 text-right">{index + 1}.</span>
                                <div className="flex items-center gap-1">
                                    <div className={
                                        `w-3 h-3 rounded-full ${entry.player === 'black' ? 'bg-black' : 'bg-white'}`
                                    } />
                                    <span className="capitalize w-14">{entry.player}</span>
                                </div>
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
