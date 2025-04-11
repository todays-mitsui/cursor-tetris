import { createSignal, onCleanup } from 'solid-js';
import { GameState, Tetromino, TetrominoType } from '../types/game';
import { createTetromino, TETROMINO_SHAPES } from '../utils/tetrominoes';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const FALL_INTERVAL = 1000; // 1秒ごとに落下

const createEmptyGrid = (): GameState['grid'] => {
  console.log('Creating empty grid');
  return Array(GRID_HEIGHT).fill(null).map(() => 
    Array(GRID_WIDTH).fill(null).map(() => ({ filled: false }))
  );
};

const getRandomTetrominoType = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const type = types[Math.floor(Math.random() * types.length)];
  console.log('Generated random tetromino type:', type);
  return type;
};

const isValidPosition = (tetromino: Tetromino, grid: GameState['grid']): boolean => {
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const newX = tetromino.position.x + x;
        const newY = tetromino.position.y + y;

        // 画面外チェック
        if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
          console.log('Invalid position - Out of bounds:', { x: newX, y: newY });
          return false;
        }

        // 他のブロックとの衝突チェック
        if (grid[newY][newX].filled) {
          console.log('Invalid position - Collision at:', { x: newX, y: newY });
          return false;
        }
      }
    }
  }
  return true;
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

  let fallInterval: number | undefined;

  const spawnNewTetromino = (type?: TetrominoType) => {
    const newType = type || getRandomTetrominoType();
    const newTetromino = createTetromino(newType);
    console.log('Spawning new tetromino:', { type: newType, position: newTetromino.position });
    
    setGameState(prev => ({
      ...prev,
      currentTetromino: prev.nextTetromino || newTetromino,
      nextTetromino: newTetromino,
    }));

    // 出現位置で衝突する場合はゲームオーバー
    if (!isValidPosition(newTetromino, gameState().grid)) {
      console.log('Game Over - Spawn position blocked');
      setGameState(prev => ({ ...prev, gameOver: true }));
      stopFalling();
    }
  };

  const moveTetromino = (dx: number, dy: number) => {
    console.log('Moving tetromino:', { dx, dy });
    setGameState(prev => {
      if (!prev.currentTetromino) {
        console.log('No current tetromino to move');
        return prev;
      }

      const newPosition = {
        x: prev.currentTetromino.position.x + dx,
        y: prev.currentTetromino.position.y + dy,
      };

      const movedTetromino = {
        ...prev.currentTetromino,
        position: newPosition,
      };

      // 移動先が有効な位置かチェック
      if (!isValidPosition(movedTetromino, prev.grid)) {
        console.log('Cannot move tetromino to:', newPosition);
        return prev;
      }

      console.log('Moved tetromino to:', newPosition);
      return {
        ...prev,
        currentTetromino: movedTetromino,
      };
    });
  };

  const rotateTetromino = (clockwise: boolean) => {
    console.log('Rotating tetromino:', clockwise ? 'clockwise' : 'counter-clockwise');
    setGameState(prev => {
      if (!prev.currentTetromino) {
        console.log('No current tetromino to rotate');
        return prev;
      }

      const shape = prev.currentTetromino.shape;
      const newShape = clockwise
        ? shape[0].map((_, i) => shape.map(row => row[i]).reverse())
        : shape[0].map((_, i) => shape.map(row => row[shape.length - 1 - i]));

      const rotatedTetromino = {
        ...prev.currentTetromino,
        shape: newShape,
      };

      // 回転後の位置が有効かチェック
      if (!isValidPosition(rotatedTetromino, prev.grid)) {
        console.log('Cannot rotate tetromino - Invalid position');
        return prev;
      }

      console.log('Rotated tetromino successfully');
      return {
        ...prev,
        currentTetromino: rotatedTetromino,
      };
    });
  };

  const startFalling = () => {
    if (fallInterval) return;
    console.log('Starting fall interval');
    fallInterval = window.setInterval(() => {
      const state = gameState();
      if (state.gameOver || state.isPaused || !state.currentTetromino) {
        console.log('Skipping fall:', { gameOver: state.gameOver, isPaused: state.isPaused });
        return;
      }

      // 下に移動できるかチェック
      const movedTetromino = {
        ...state.currentTetromino,
        position: {
          ...state.currentTetromino.position,
          y: state.currentTetromino.position.y + 1,
        },
      };

      if (isValidPosition(movedTetromino, state.grid)) {
        moveTetromino(0, 1);
      } else {
        console.log('Tetromino reached bottom or obstacle');
        // 移動できない場合は固定して新しいテトリミノを生成
        spawnNewTetromino();
      }
    }, FALL_INTERVAL);
  };

  const stopFalling = () => {
    if (fallInterval) {
      console.log('Stopping fall interval');
      clearInterval(fallInterval);
      fallInterval = undefined;
    }
  };

  const startGame = () => {
    console.log('Starting new game');
    setGameState(prev => ({
      ...prev,
      grid: createEmptyGrid(),
      score: 0,
      gameOver: false,
    }));
    spawnNewTetromino();
    startFalling();
  };

  // クリーンアップ
  onCleanup(() => {
    console.log('Cleaning up game resources');
    stopFalling();
  });

  return {
    gameState,
    startGame,
    moveTetromino,
    rotateTetromino,
    spawnNewTetromino,
  };
}; 