export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  filled: boolean;
  color?: string;
}

export interface Tetromino {
  type: TetrominoType;
  shape: boolean[][];
  color: string;
  position: Position;
}

export interface GameState {
  grid: Cell[][];
  currentTetromino: Tetromino | null;
  nextTetromino: Tetromino | null;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
} 