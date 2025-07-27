'use server';
/**
 * @fileOverview This file defines a Genkit flow for visualizing the AI's move choices in real-time during Othello training.
 *
 * - visualizeAiDecision - A function that takes the current board state and AI's potential moves to provide a visualized explanation.
 * - VisualizeAiDecisionInput - The input type for the visualizeAiDecision function.
 * - VisualizeAiDecisionOutput - The return type for the visualizeAiDecision function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeAiDecisionInputSchema = z.object({
  boardState: z.string().describe('The current state of the Othello board as a string representation.'),
  possibleMoves: z.array(z.object({
    row: z.number().describe('The row index of the possible move.'),
    col: z.number().describe('The column index of the possible move.'),
    score: z.number().describe('The score associated with the possible move, indicating its desirability.'),
  })).describe('An array of possible moves the AI could make, with their associated scores.'),
});
export type VisualizeAiDecisionInput = z.infer<typeof VisualizeAiDecisionInputSchema>;

const VisualizeAiDecisionOutputSchema = z.object({
  explanation: z.string().describe('A textual explanation of the AI\u0027s decision-making process, highlighting the chosen move and its rationale based on the board state and move scores.'),
});
export type VisualizeAiDecisionOutput = z.infer<typeof VisualizeAiDecisionOutputSchema>;

export async function visualizeAiDecision(input: VisualizeAiDecisionInput): Promise<VisualizeAiDecisionOutput> {
  return visualizeAiDecisionFlow(input);
}

const visualizeAiDecisionPrompt = ai.definePrompt({
  name: 'visualizeAiDecisionPrompt',
  input: {schema: VisualizeAiDecisionInputSchema},
  output: {schema: VisualizeAiDecisionOutputSchema},
  prompt: `You are an AI move explainer for the game of Othello. Given the current board state and a list of possible moves with their scores, explain which move the AI should choose and why. Highlight the board position, and how the AI determined the best move from the list of available moves.

Current Board State:
{{boardState}}

Possible Moves and Scores:
{{#each possibleMoves}}
  Row: {{this.row}}, Col: {{this.col}}, Score: {{this.score}}
{{/each}}

Explain the AI\u0027s decision-making process in a clear and concise manner. Focus on the move with the highest score and justify why that move is strategically advantageous in the current board state. 
`,
});

const visualizeAiDecisionFlow = ai.defineFlow(
  {
    name: 'visualizeAiDecisionFlow',
    inputSchema: VisualizeAiDecisionInputSchema,
    outputSchema: VisualizeAiDecisionOutputSchema,
  },
  async input => {
    const {output} = await visualizeAiDecisionPrompt(input);
    return output!;
  }
);
