import { createSignal, onCleanup, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { GameState, Tetromino, TetrominoType, Cell } from '../types/game';
import { createTetromino } from '../utils/tetrominoes';
import { sleep } from '../utils/sleep';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const FALL_INTERVAL = 1000; // 1秒ごとに落下
const CLEAR_LINES_DELAY = 200;
const HARD_DROP_INTERVAL = 10; // 高速落下時の待ち時間（ms）

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

const findFullLines = (grid: Cell[][]): number[] => {
  const fullLines: number[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    if (grid[y].every(cell => cell.filled)) {
      fullLines.push(y);
    }
  }
  return fullLines;
};

export const removeLines = (grid: Cell[][], linesToRemove: number[]): Cell[][] => {
  if (linesToRemove.length === 0) return grid;

  const newGrid = [...grid];
  const gridWidth = grid[0].length;
  
  // 有効な行インデックスのみをフィルタリング
  const validLines = linesToRemove
    .filter(index => index >= 0 && index < grid.length)
    .sort((a, b) => b - a);

  if (validLines.length === 0) return grid;

  // 有効な行を削除
  validLines.forEach(lineIndex => {
    newGrid.splice(lineIndex, 1);
  });

  // 削除した行数分の新しい行を上に追加
  const newLines = Array(validLines.length)
    .fill(null)
    .map(() => Array(gridWidth)
      .fill(null)
      .map(() => ({ filled: false }))
    );
  
  newGrid.unshift(...newLines);

  return newGrid;
};

const calculateScore = (lineCount: number): number => {
  // 消した行数に応じてスコアを計算
  switch (lineCount) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 500;
    case 4: return 800;
    default: return 0;
  }
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

  let isFalling = false;

  const fixTetromino = async () => {
    const state = gameState();
    if (!state.currentTetromino) return;

    // 現在のテトリミノを固定
    const newGrid = [...state.grid];
    const tetromino = state.currentTetromino;
    tetromino.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const gridY = tetromino.position.y + y;
          const gridX = tetromino.position.x + x;
          if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
            newGrid[gridY][gridX] = {
              filled: true,
              color: tetromino.color,
            };
          }
        }
      });
    });

    // 揃った行を見つける
    const fullLines = findFullLines(newGrid);
    
    if (fullLines.length > 0) {
      // テトリミノを固定した状態を一旦表示
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        currentTetromino: null,
      }));

      // 行が揃っている場合、消去前に待機
      await sleep(CLEAR_LINES_DELAY);

      // 揃った行を消して新しい行を追加
      const updatedGrid = removeLines(newGrid, fullLines);
      const additionalScore = calculateScore(fullLines.length);

      setGameState(prev => ({
        ...prev,
        grid: updatedGrid,
        score: prev.score + additionalScore,
      }));
    } else {
      // 行が揃っていない場合は即座に状態を更新
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        currentTetromino: null,
      }));
    }
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

  const startFalling = async () => {
    if (isFalling) return;
    console.log('Starting fall loop');
    isFalling = true;

    try {
      while (isFalling) {
        const state = gameState();
        if (state.gameOver || state.isPaused || !state.currentTetromino) {
          console.log('Skipping fall:', { gameOver: state.gameOver, isPaused: state.isPaused });
          await sleep(FALL_INTERVAL);
          continue;
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
          await fixTetromino();
          spawnNewTetromino();
        }

        await sleep(FALL_INTERVAL);
      }
    } catch (error) {
      console.error('Error in fall loop:', error);
      isFalling = false;
    }
  };

  const stopFalling = () => {
    console.log('Stopping fall loop');
    isFalling = false;
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

  const hardDrop = async () => {
    const state = gameState();
    if (state.gameOver || !state.currentTetromino) return;

    // 落下可能な距離を計算
    let dropDistance = 0;
    while (isValidPosition({
      ...state.currentTetromino,
      position: {
        ...state.currentTetromino.position,
        y: state.currentTetromino.position.y + dropDistance + 1,
      },
    }, state.grid)) {
      dropDistance++;
    }

    // 一度に移動
    if (dropDistance > 0) {
      setGameState(prev => ({
        ...prev,
        currentTetromino: {
          ...prev.currentTetromino!,
          position: {
            ...prev.currentTetromino!.position,
            y: prev.currentTetromino!.position.y + dropDistance,
          },
        },
      }));
    }

    // 固定して新しいテトリミノを生成
    await fixTetromino();
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