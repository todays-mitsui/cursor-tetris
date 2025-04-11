export type Cell = {
  filled: boolean;
  color?: string;
};

export type Position = {
  x: number;
  y: number;
};

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type Tetromino = {
  type: TetrominoType;
  shape: boolean[][];
  position: Position;
  color: string;
};

export type GameState = {
  grid: Cell[][];
  currentTetromino: Tetromino | null;
  nextTetromino: Tetromino | null;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
}; 