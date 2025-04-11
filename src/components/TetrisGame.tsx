import { Component, onMount } from 'solid-js';
import { useGame } from '../hooks/useGame';
import { TetrominoType, Cell } from '../types/game';
import styles from './TetrisGame.module.css';

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const TetrisGame: Component = () => {
  const { gameState, startGame, moveTetromino, rotateTetromino, spawnNewTetromino, hardDrop } = useGame();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState().gameOver) {
      console.log('Ignoring key press - game over');
      return;
    }

    console.log('Key pressed:', e.key, e.shiftKey ? 'with shift' : '');
    switch (e.key) {
      case 'ArrowLeft':
        moveTetromino(-1, 0);
        break;
      case 'ArrowRight':
        moveTetromino(1, 0);
        break;
      case 'ArrowUp':
        hardDrop(); // ハードドロップ
        break;
      case 'ArrowDown':
        moveTetromino(0, 1); // ソフトドロップ
        break;
      case ' ':
        if (e.shiftKey) {
          rotateTetromino(false); // 左回転
        } else {
          rotateTetromino(true); // 右回転
        }
        break;
    }
  };

  onMount(() => {
    console.log('TetrisGame component mounted');
    window.addEventListener('keydown', handleKeyDown);
    startGame();
  });

  const getCellColor = (cell: Cell, row: number, col: number): string => {
    const state = gameState();
    // 現在のテトリミノの位置にあるセルの色を返す
    if (state.currentTetromino) {
      const tetromino = state.currentTetromino;
      const relativeRow = row - tetromino.position.y;
      const relativeCol = col - tetromino.position.x;

      if (
        relativeRow >= 0 &&
        relativeRow < tetromino.shape.length &&
        relativeCol >= 0 &&
        relativeCol < tetromino.shape[0].length &&
        tetromino.shape[relativeRow][relativeCol]
      ) {
        return tetromino.color;
      }
    }

    // 固定されたブロックの色を返す
    return cell.color || '#222';
  };

  return (
    <div class={styles.gameContainer}>
      <div class={styles.gameInfo}>
        <div class={styles.score}>Score: {gameState().score}</div>
        <div class={styles.nextPiece}>
          <h3>Next Piece</h3>
          <div class={styles.nextPiecePreview}>
            {gameState().nextTetromino && (
              <div 
                class={styles.nextPieceGrid}
                style={{
                  "--next-piece-grid-columns": `${gameState().nextTetromino!.shape[0].length}`,
                  "--next-piece-grid-rows": `${gameState().nextTetromino!.shape.length}`
                } as any}
              >
                {gameState().nextTetromino.shape.map((row, y) => (
                  row.map((cell, x) => (
                    <div
                      class={`${styles.cell} ${cell ? styles.filled : ''}`}
                      style={{ "background-color": cell ? gameState().nextTetromino!.color : '#222' }}
                    />
                  ))
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div class={styles.gameBoard}>
        {gameState().grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              class={`${styles.cell} ${cell.filled ? styles.filled : ''}`}
              style={{ "background-color": getCellColor(cell, rowIndex, colIndex) }}
            />
          ))
        ))}
      </div>
      {gameState().gameOver && (
        <div class={styles.gameOver}>
          <h2>Game Over</h2>
          <button onClick={() => {
            console.log('Restarting game');
            startGame();
          }}>Play Again</button>
        </div>
      )}
      <div class={styles.debugControls}>
        {TETROMINO_TYPES.map(type => (
          <button
            onClick={() => {
              console.log('Debug: Spawning tetromino:', type);
              spawnNewTetromino(type);
            }}
            class={styles.debugButton}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TetrisGame; 