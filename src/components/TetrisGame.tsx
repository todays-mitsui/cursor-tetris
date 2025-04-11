import { Component, onMount } from 'solid-js';
import { useGame } from '../hooks/useGame';
import styles from './TetrisGame.module.css';

const TetrisGame: Component = () => {
  const { gameState, startGame, moveTetromino, rotateTetromino } = useGame();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState().gameOver) return;

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
          <button onClick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default TetrisGame; 