
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart, TrendingUp, TrendingDown } from 'lucide-react';
import WinRateChart from '@/components/win-rate-chart';

export default function WinRateGuidePage() {
  const exampleData = [
    { games: 10, aiWins: 3, opponentWins: 7 },
    { games: 20, aiWins: 8, opponentWins: 12 },
    { games: 30, aiWins: 16, opponentWins: 14 },
    { games: 40, aiWins: 26, opponentWins: 14 },
    { games: 50, aiWins: 38, opponentWins: 12 },
  ];

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
            Win-Rate Progress Guide
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Understanding the AI's learning curve over time.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart className="w-6 h-6 text-primary" />
              Chart Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              The "Win-Rate Progress" chart is a visual representation of the AI's performance over a series of simulated games. It's designed to show how an AI model might improve as it gains more "experience." In this application, the data is for demonstration purposes and is simulated when you start a new training session.
            </p>
            <div className="p-4 border rounded-lg">
                <WinRateChart data={exampleData} />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Reading the Chart
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    <strong>X-Axis (Horizontal):</strong> This represents the total number of games played in a training batch (e.g., 10 G, 20 G). It shows the progression of the training process.
                </p>
                <p>
                    <strong>Y-Axis (Vertical):</strong> This shows the number of wins.
                </p>
                <div>
                    <p><strong>Bars:</strong> Each bar is split into two colors:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><span className="font-semibold text-primary">Blue (AI Wins):</span> The bottom portion of the bar shows the number of games won by our AI.</li>
                        <li><span className="font-semibold text-muted-foreground/80">Gray (Opponent Wins):</span> The top portion shows the number of games won by the opponent.</li>
                    </ul>
                </div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingDown className="w-5 h-5 text-primary" />
                    Interpreting the Data
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    The primary goal is to see the blue portion of the bars (AI Wins) grow larger as you move from left to right across the chart.
                </p>
                <p>
                   An upward trend in the AI's win count across game batches indicates that the AI is "learning" and improving its strategy. A successful training session would show a clear dominance of the AI's wins over the opponent's wins in later batches.
                </p>
                 <p>
                    Clicking the "Start New Training Session" button will generate a new set of random data to simulate a fresh learning cycle for the AI.
                </p>
            </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
