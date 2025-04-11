import { createSignal, onCleanup } from 'solid-js';
import { GameState, Tetromino, TetrominoType } from '../types/game';
import { createTetromino, TETROMINO_SHAPES } from '../utils/tetrominoes';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 30;

const createEmptyGrid = (): GameState['grid'] => 
  Array(GRID_HEIGHT).fill(null).map(() => 
    Array(GRID_WIDTH).fill(null).map(() => ({ filled: false }))
  );

const getRandomTetrominoType = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

export const useGame = () => {
  const [gameState, setGameState] = createSignal<GameState>({
    grid: createEmptyGrid(),
    currentTetromino: null,
    nextTetromino: null,
    score: 0,
    gameOver: false,
    isPaused: false,
  });

  const spawnNewTetromino = () => {
    const type = getRandomTetrominoType();
    const newTetromino = createTetromino(type);
    
    setGameState(prev => ({
      ...prev,
      currentTetromino: prev.nextTetromino || newTetromino,
      nextTetromino: newTetromino,
    }));
  };

  const moveTetromino = (dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentTetromino) return prev;

      const newPosition = {
        x: prev.currentTetromino.position.x + dx,
        y: prev.currentTetromino.position.y + dy,
      };

      // 衝突判定をここに実装

      return {
        ...prev,
        currentTetromino: {
          ...prev.currentTetromino,
          position: newPosition,
        },
      };
    });
  };

  const rotateTetromino = (clockwise: boolean) => {
    setGameState(prev => {
      if (!prev.currentTetromino) return prev;

      const shape = prev.currentTetromino.shape;
      const newShape = clockwise
        ? shape[0].map((_, i) => shape.map(row => row[i]).reverse())
        : shape[0].map((_, i) => shape.map(row => row[shape.length - 1 - i]));

      // 回転後の衝突判定をここに実装

      return {
        ...prev,
        currentTetromino: {
          ...prev.currentTetromino,
          shape: newShape,
        },
      };
    });
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      grid: createEmptyGrid(),
      score: 0,
      gameOver: false,
    }));
    spawnNewTetromino();
  };

  return {
    gameState,
    startGame,
    moveTetromino,
    rotateTetromino,
  };
}; 