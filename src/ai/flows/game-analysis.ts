'use server';
/**
 * @fileOverview A Genkit flow for analyzing a completed game of Othello.
 *
 * - analyzeGame - A function that takes the move history and provides an AI-powered analysis.
 * - AnalyzeGameInput - The input type for the analyzeGame function.
 * - AnalyzeGameOutput - The return type for the analyzeGame function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeGameInputSchema = z.object({
  moveHistory: z.string().describe("The full move history of the game, in algebraic notation (e.g., '1. black f5, 2. white e6, ...')."),
  winner: z.string().describe("The winner of the game ('black', 'white', or 'draw')."),
  finalScore: z.string().describe("The final score of the game (e.g., 'Black: 35, White: 29')."),
});
export type AnalyzeGameInput = z.infer<typeof AnalyzeGameInputSchema>;

const AnalyzeGameOutputSchema = z.object({
  openingSummary: z.string().describe("A brief summary of the opening phase of the game."),
  midGameTurningPoint: z.string().describe("Identifies and explains the key turning point in the middle of the game."),
  endGameRecap: z.string().describe("A recap of the end-game strategy and execution."),
  overallFeedback: z.string().describe("Overall strategic feedback for both players."),
});
export type AnalyzeGameOutput = z.infer<typeof AnalyzeGameOutputSchema>;

export async function analyzeGame(input: AnalyzeGameInput): Promise<AnalyzeGameOutput> {
  return analyzeGameFlow(input);
}

const gameAnalysisPrompt = ai.definePrompt({
  name: 'gameAnalysisPrompt',
  input: {schema: AnalyzeGameInputSchema},
  output: {schema: AnalyzeGameOutputSchema},
  prompt: `You are an expert Othello coach. You will be given the full move history of a game, the winner, and the final score. Your task is to provide a concise and insightful post-game analysis.

Game Details:
- Move History: {{moveHistory}}
- Winner: {{winner}}
- Final Score: {{finalScore}}

Please provide the following analysis:
1.  **Opening Summary:** Briefly describe the opening strategy of both players. (e.g., "Black opened with a classic central control strategy, while White focused on early edge positions.")
2.  **Mid-Game Turning Point:** Identify the single most critical move or sequence of moves in the mid-game that shifted the momentum. Explain why it was so important.
3.  **End-Game Recap:** Summarize how the game concluded. Did the winning player secure their lead effectively? Did the losing player miss any late-game opportunities?
4.  **Overall Feedback:** Provide one key piece of strategic advice for each player based on their performance in this game.

Keep your analysis clear, constructive, and easy to understand for an intermediate player.`,
});

const analyzeGameFlow = ai.defineFlow(
  {
    name: 'analyzeGameFlow',
    inputSchema: AnalyzeGameInputSchema,
    outputSchema: AnalyzeGameOutputSchema,
  },
  async input => {
    const {output} = await gameAnalysisPrompt(input);
    return output!;
  }
);
