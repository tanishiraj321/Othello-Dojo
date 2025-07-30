export type Player = 'black' | 'white';
export type CellState = Player | 'empty';
export type BoardState = CellState[][];
export type Move = { row: number; col: number };
export type GameMode = 'playerVsAi' | 'aiVsAi';
