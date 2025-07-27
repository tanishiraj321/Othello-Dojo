'use server';

/**
 * @fileOverview An AI agent that suggests good moves for Othello.
 *
 * - suggestGoodMoves - A function that suggests good moves.
 * - SuggestGoodMovesInput - The input type for the suggestGoodMoves function.
 * - SuggestGoodMovesOutput - The return type for the suggestGoodMoves function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGoodMovesInputSchema = z.object({
  boardState: z.string().describe('The current state of the Othello board.'),
  player: z.string().describe('The current player (black or white).'),
});
export type SuggestGoodMovesInput = z.infer<typeof SuggestGoodMovesInputSchema>;

const SuggestGoodMovesOutputSchema = z.object({
  move: z.object({
      row: z.number().describe('The row index of the suggested move (0-7).'),
      col: z.number().describe('The column index of the suggested move (0-7).'),
  }).describe('The suggested move coordinates.'),
  rationale: z
    .string()
    .describe('The rationale behind the suggested move.'),
});
export type SuggestGoodMovesOutput = z.infer<typeof SuggestGoodMovesOutputSchema>;

export async function suggestGoodMoves(input: SuggestGoodMovesInput): Promise<SuggestGoodMovesOutput> {
  return suggestGoodMovesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGoodMovesPrompt',
  input: {schema: SuggestGoodMovesInputSchema},
  output: {schema: SuggestGoodMovesOutputSchema},
  prompt: `You are an expert Othello player and strategist. Given the current state of the board and the current player, suggest a good move and explain your reasoning. The top-left corner is row 0, col 0.

Board State (B=Black, W=White, _=Empty):
{{boardState}}

Current Player: {{player}}

Consider the following when making your suggestion:
* Maximize your potential to flip opponent's pieces.
* Position yourself for future strategic advantages.
* Avoid moves that immediately benefit your opponent.

Return the suggested move as a row and column index.`,
});

const suggestGoodMovesFlow = ai.defineFlow(
  {
    name: 'suggestGoodMovesFlow',
    inputSchema: SuggestGoodMovesInputSchema,
    outputSchema: SuggestGoodMovesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
