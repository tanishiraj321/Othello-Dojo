'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gamepad2, Lightbulb, Eye, Repeat, Cpu } from 'lucide-react';

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body">
      <header className="mb-8 flex justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/about">
            About Page
            <ArrowLeft className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>
      <main className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tighter text-primary">
            How to Use OthelloAI Dojo
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            A guide to playing, learning, and observing the AI.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gamepad2 className="w-6 h-6 text-primary" />
              Playing the Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              The main goal is to have more of your colored pieces on the board than your opponent by the time the last playable square is filled.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Start a Game:</strong> From the "Game Status" panel, choose your desired AI difficulty, then select whether you want to play as "Black" or "White". Black always goes first.</li>
                <li><strong>Making a Move:</strong> On your turn, the board will highlight all valid moves with a semi-transparent red circle. Click on one of these circles to place your piece.</li>
                <li><strong>How Moves Work:</strong> You must place a piece on the board so that at least one of your opponent's pieces is "sandwiched" between your new piece and another one of your pieces. All sandwiched pieces will be flipped to your color.</li>
                <li><strong>Game End:</strong> The game ends when neither player has a valid move. The player with the most pieces on the board wins.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Cpu className="w-6 h-6 text-primary" />
              AI Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Lightbulb className="w-5 h-5"/> Suggest a Move</h3>
              <p className="text-muted-foreground">
                If you're unsure what to do on your turn, click the "Suggest a Move" button. The generative AI will analyze the board and provide you with a recommended move and the rationale behind it. This is a great way to learn Othello strategy.
              </p>
            </div>
             <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Eye className="w-5 h-5"/> Visualize AI Decision</h3>
              <p className="text-muted-foreground">
                Ever wonder what the AI is "thinking"? Click "Visualize AI Decision" to get a natural language explanation of the AI's most recent move (or its potential next move). It breaks down why it considers a particular move to be the strongest choice in the current situation.
              </p>
            </div>
             <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Repeat className="w-5 h-5"/> Start New Training Session</h3>
              <p className="text-muted-foreground">
                This button resets the AI's "learning" progress, which is visualized in the Win-Rate chart. In this demo, the training data is simulated, but this function demonstrates how you could trigger a retraining or a new simulation run for a learning AI model.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
