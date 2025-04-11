import { Component, onMount } from 'solid-js';
import { useGame } from '../hooks/useGame';
import { TetrominoType } from '../types/game';
import styles from './TetrisGame.module.css';

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const TetrisGame: Component = () => {
  const { gameState, startGame, moveTetromino, rotateTetromino, spawnNewTetromino } = useGame();

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
        if (e.shiftKey) {
          rotateTetromino(false); // 左回転
        } else {
          rotateTetromino(true); // 右回転
        }
        break;
      case 'ArrowDown':
        moveTetromino(0, 1);
        break;
    }
  };

  onMount(() => {
    console.log('TetrisGame component mounted');
    window.addEventListener('keydown', handleKeyDown);
    startGame();
  });

  return (
    <div class={styles.gameContainer}>
      <div class={styles.gameInfo}>
        <div class={styles.score}>Score: {gameState().score}</div>
        <div class={styles.nextPiece}>
          <h3>Next Piece</h3>
          {/* 次のテトリミノのプレビューをここに実装 */}
        </div>
      </div>
      <div class={styles.gameBoard}>
        {/* ゲームボードのグリッドをここに実装 */}
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