import { Component, onMount, Show, createEffect } from 'solid-js';
import { useGame } from '../hooks/useGame';
import styles from './TetrisGame.module.css';
import GameBoard from './GameBoard';
import ScoreDisplay from './ScoreDisplay';
import NextPiecePreview from './NextPiecePreview';
import ControlsGuide from './ControlsGuide';
import GameOverModal from './GameOverModal';
import { Tetromino } from '../types/game';

const TetrisGame: Component = () => {
  const { gameState, startGame, moveTetromino, rotateTetromino, hardDrop } = useGame();
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
        hardDrop();
        break;
      case 'ArrowDown':
        moveTetromino(0, 1);
        break;
      case ' ':
        if (e.shiftKey) {
          rotateTetromino(false);
        } else {
          rotateTetromino(true);
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

  const getNextTetromino = (): Tetromino | undefined => {
    const next = gameState().nextTetromino;
    return next || undefined;
  };

  return (
    <div class={styles.gameContainer}>
      <GameBoard gameState={gameState} />

      <div class={styles.gameInfo}>
        <ScoreDisplay score={gameState().score} />
        <NextPiecePreview nextTetromino={getNextTetromino} />
        <ControlsGuide />
      </div>

      <Show when={gameState().gameOver}>
        <GameOverModal
          onPlayAgain={startGame}
          buttonRef={(el) => playAgainButton = el}
        />
      </Show>
    </div>
  );
};

export default TetrisGame; 