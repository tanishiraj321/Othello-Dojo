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
  move: z.string().describe('The suggested move for the current player.'),
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
  prompt: `You are an expert Othello player and strategist. Given the current state of the board and the current player, suggest a good move and explain your reasoning. 

Board State:
{{boardState}}

Current Player: {{player}}

Consider the following when making your suggestion:
* Maximize your potential to flip opponent's pieces.
* Position yourself for future strategic advantages.
* Avoid moves that immediately benefit your opponent.

Move:`,
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
