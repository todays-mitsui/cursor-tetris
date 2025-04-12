import { Component, onMount, Show, createEffect } from 'solid-js';
import { useGame } from '../hooks/useGame';
import { TetrominoType, Cell } from '../types/game';
import styles from './TetrisGame.module.css';

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const TetrisGame: Component = () => {
  const { gameState, startGame, moveTetromino, rotateTetromino, spawnNewTetromino, hardDrop } = useGame();
  let playAgainButton: HTMLButtonElement | undefined;

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

  createEffect(() => {
    if (gameState().gameOver && playAgainButton) {
      playAgainButton.focus();
    }
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

      <div class={styles.gameInfo}>
        <div class={styles.score}>
          <span class={styles.scoreLabel}>Score</span>
          <span class={styles.scoreValue}>{gameState().score}</span>
        </div>
        <div class={styles.nextPiece}>
          <h3>Next Piece</h3>
          <div class={styles.nextPiecePreview}>
            <Show when={gameState().nextTetromino}>
              {(nextTetromino) => (
                <div 
                  class={styles.nextPieceGrid}
                  style={{
                    "--next-piece-grid-columns": `${nextTetromino().shape[0].length}`,
                    "--next-piece-grid-rows": `${nextTetromino().shape.length}`
                  } as any}
                >
                  {nextTetromino().shape.map((row) => (
                    row.map((cell) => (
                      <div
                        class={`${styles.cell} ${cell ? styles.filled : ''}`}
                        style={{ "background-color": cell ? nextTetromino().color : '#222' }}
                      />
                    ))
                  ))}
                </div>
              )}
            </Show>
          </div>
        </div>

        <div class={styles.controls}>
          <h3>操作説明</h3>
          <ul class={styles.controlsList}>
            <li><kbd>←</kbd> 左に移動</li>
            <li><kbd>→</kbd> 右に移動</li>
            <li><kbd>↓</kbd> 下に移動（ソフトドロップ）</li>
            <li><kbd>↑</kbd> 即時落下（ハードドロップ）</li>
            <li><kbd>Space</kbd> 右回転</li>
            <li><kbd>Shift</kbd> + <kbd>Space</kbd> 左回転</li>
          </ul>
        </div>
      </div>

      <Show when={gameState().gameOver}>
        <div class={styles.gameOver}>
          <h2>Game Over</h2>
          <button
            ref={playAgainButton}
            onClick={() => {
              console.log('Restarting game');
              startGame();
            }}
          >
            Play Again
          </button>
        </div>
      </Show>

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