'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BrainCircuit, Code, Users, ExternalLink, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 font-body">
      <header className="mb-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Link>
        </Button>
      </header>
      <main className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tighter text-primary">
            About OthelloAI Dojo
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            How a simple game-playing AI comes to life.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BrainCircuit className="w-6 h-6 text-primary" />
              AI Training and Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              The AI opponent in this application was trained using a combination of classic game theory and modern AI techniques. The core of its decision-making process is the <strong>Minimax algorithm</strong> with <strong>Alpha-Beta Pruning</strong>.
            </p>
            <p>
              <strong>Minimax</strong> is a recursive algorithm used in two-player, zero-sum games (like Othello) to choose the optimal move. It works by creating a tree of all possible moves a few steps into the future. The AI assumes the player will always make the best move for them (maximizing their score), and the AI will try to make the move that minimizes the player's potential maximum score. The "depth" of this search tree determines the difficulty. A deeper search means the AI "thinks" more moves ahead, resulting in a tougher opponent.
            </p>
            <p>
              The AI also leverages a generative AI model (powered by Google's Gemini) for two key features:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Move Suggestion:</strong> When you ask for a suggestion, the current board state is sent to the AI model, which analyzes it based on strategic principles of Othello (e.g., controlling corners, maximizing mobility, forcing opponent into bad positions) to recommend a strong move.</li>
              <li><strong>Decision Visualization:</strong> The visualization feature provides a natural language explanation of the AI's thought process. It explains why one move is considered superior to others in the current context of the game.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Code className="w-6 h-6 text-primary" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This entire application was built with the help of an AI coding assistant. It's a demonstration of how AI can accelerate and enhance the development process. The following technologies were used:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Framework:</strong> Next.js (React)</li>
              <li><strong>Styling:</strong> Tailwind CSS and ShadCN UI for pre-built, accessible components.</li>
              <li><strong>Generative AI:</strong> Google's Gemini models accessed via Genkit.</li>
              <li><strong>Language:</strong> TypeScript</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6 text-primary" />
              Resources & Further Reading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
              <a href="https://en.wikipedia.org/wiki/Reversi" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                  <ExternalLink className="w-4 h-4 mr-2" /> Othello (Reversi) on Wikipedia
              </a>
              <a href="https://en.wikipedia.org/wiki/Minimax" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                  <ExternalLink className="w-4 h-4 mr-2" /> Minimax Algorithm on Wikipedia
              </a>
              <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                  <ExternalLink className="w-4 h-4 mr-2" /> Next.js Official Website
              </a>
              <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                  <ExternalLink className="w-4 h-4 mr-2" /> Tailwind CSS Official Website
              </a>
               <a href="https://ai.google/gemini" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                  <ExternalLink className="w-4 h-4 mr-2" /> Google Gemini
              </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-primary" />
              Acknowledgements
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              This project was inspired by the classic board game Othello (also known as Reversi) and the fascinating field of game-playing AI, pioneered by visionaries like Claude Shannon and John von Neumann.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
