# OthelloAI Dojo
This project is being maintained by  IEEE Information Theory Society . VIT Vellore Chapter.
Welcome to the OthelloAI Dojo! This is a modern, interactive web application built with Next.js that allows users to play the classic game of Othello (also known as Reversi) against an AI opponent. The application serves as a demonstration of how modern AI and web technologies can be combined to create engaging, intelligent experiences. Users can not only play the game but also learn from the AI by requesting move suggestions and visualizing its decision-making process.

## Features

- **Interactive Othello Board**: A fully functional 8x8 Othello game board.
- **AI Opponent**: Play against an AI whose difficulty can be adjusted (Easy, Medium, Hard).
- **Valid Move Highlighting**: The UI shows all possible valid moves for the current player.
- **AI Move Suggestion**: Leveraging a generative AI model (Google Gemini), players can ask for a suggested move and receive a strategic rationale.
- **AI Decision Visualization**: Get a natural language explanation of the AI's thought process for its moves.
- **Simulated Training Progress**: A win-rate chart visualizes the AI's (simulated) learning progress over a series of games.
- **Detailed Guides**: Includes separate pages explaining how to use the app, how to interpret the win-rate chart, and a general "About" page.
- **Responsive Design**: A clean, modern, and responsive user interface suitable for all screen sizes.

## Technology Stack

This project was built with the help of an AI coding assistant and utilizes a modern, type-safe technology stack.

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Google Gemini](https://ai.google/gemini) via [Genkit](https://firebase.google.com/docs/genkit), Google's open-source generative AI framework.
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)

## How It Works

### Core Game Logic (`src/lib/othello.ts`)

The fundamental rules of Othello are implemented in pure TypeScript. This includes functions for:
- Creating the initial board state.
- Identifying all valid moves for a given player.
- Applying a move to the board and flipping the opponent's pieces.
- Calculating the score.

### AI Opponent (`src/lib/minimax.ts`)

The AI that plays against the user is powered by the **Minimax algorithm**, a classic decision-making algorithm used in two-player, zero-sum games.
- **Alpha-Beta Pruning** is implemented to optimize the search tree, allowing the AI to "look ahead" more efficiently.
- The **difficulty setting** in the UI corresponds to the `depth` of the Minimax search. A higher depth means the AI considers more future moves, resulting in more challenging gameplay.

### Generative AI Features (`src/ai/flows/`)

The application uses **Genkit** to integrate with Google's Gemini models for its more advanced AI features. These are defined as "flows" that can be called from the frontend.

- **`suggest-good-moves.ts`**: When a user requests a move suggestion, this flow sends the current board state and player to the Gemini model. The prompt instructs the AI to act as an Othello expert and return a strategically sound move along with its rationale. The flow is configured to return structured data (the move and the rationale string).
- **`real-time-decision-visualization.ts`**: This flow takes the board state and a list of possible moves (with scores) and asks the Gemini model to provide a human-readable explanation of why the best move is strategically advantageous.

### Frontend Components (`src/components/`)

The UI is built with React components, many of which are styled using ShadCN UI. Key components include:
- **`othello-board.tsx`**: Renders the game board, pieces, and highlights for valid/suggested moves.
- **`game-info-panel.tsx`**: Displays the game state, score, and controls for starting a new game and setting difficulty.
- **`ai-panel.tsx`**: Contains the buttons for interacting with the generative AI features (suggestions, visualization).
- **`win-rate-chart.tsx`**: A chart component (using Recharts) that displays the simulated training data.

## Getting Started

To run this project locally, you'll need to have Node.js and npm installed.

1.  **Clone the repository.**
2.  **Install dependencies**: `npm install`
3.  **Set up environment variables**: Create a `.env` file and add your `GEMINI_API_KEY`.
4.  **Run the development server**: `npm run dev`

The application will be available at `http://localhost:9002`.
