import { createSignal, onCleanup } from 'solid-js';
import { GameState, Tetromino, TetrominoType } from '../types/game';
import { createTetromino } from '../utils/tetrominoes';

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

  const fixTetromino = () => {
    console.log('Fixing tetromino to grid');
    setGameState(prev => {
      if (!prev.currentTetromino) return prev;

      const newGrid = [...prev.grid.map(row => [...row])];
      const tetromino = prev.currentTetromino;

      // テトリミノの各セルをグリッドに固定
      for (let y = 0; y < tetromino.shape.length; y++) {
        for (let x = 0; x < tetromino.shape[y].length; x++) {
          if (tetromino.shape[y][x]) {
            const gridY = tetromino.position.y + y;
            const gridX = tetromino.position.x + x;
            newGrid[gridY][gridX] = {
              filled: true,
              color: tetromino.color,
            };
          }
        }
      }

      // 行の消去処理
      let clearedLines = 0;
      for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        const isLineFull = newGrid[y].every(cell => cell.filled);
        if (isLineFull) {
          // 行を消去
          newGrid.splice(y, 1);
          // 上部に空の行を追加
          newGrid.unshift(Array(GRID_WIDTH).fill(null).map(() => ({ filled: false })));
          clearedLines++;
          y++; // 同じ行を再度チェックするため
        }
      }

      // スコア計算
      let newScore = prev.score;
      if (clearedLines > 0) {
        console.log(`Cleared ${clearedLines} line(s)`);
        // 同時に消した行数に応じてスコアを加算
        // 1行: 100点
        // 2行: 300点
        // 3行: 500点
        // 4行: 800点
        const scoreTable = [0, 100, 300, 500, 800];
        newScore += scoreTable[clearedLines];
      }

      return {
        ...prev,
        grid: newGrid,
        currentTetromino: null,
        score: newScore,
      };
    });
  };

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
        fixTetromino();
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

  const hardDrop = () => {
    console.log('Hard dropping tetromino');
    setGameState(prev => {
      if (!prev.currentTetromino) {
        console.log('No current tetromino to hard drop');
        return prev;
      }

      let dropDistance = 0;
      let testTetromino = { ...prev.currentTetromino };

      // 最下部まで移動できる距離を計算
      while (true) {
        const nextPosition = {
          ...testTetromino.position,
          y: testTetromino.position.y + 1,
        };

        const nextTetromino = {
          ...testTetromino,
          position: nextPosition,
        };

        if (!isValidPosition(nextTetromino, prev.grid)) {
          break;
        }

        testTetromino = nextTetromino;
        dropDistance++;
      }

      // 実際の移動
      if (dropDistance > 0) {
        console.log('Hard dropped tetromino by', dropDistance, 'cells');
        return {
          ...prev,
          currentTetromino: testTetromino,
        };
      }

      return prev;
    });

    // 即座に固定して新しいテトリミノを生成
    fixTetromino();
    spawnNewTetromino();
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
    hardDrop,
  };
}; 