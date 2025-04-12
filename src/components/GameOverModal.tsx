import { Component } from 'solid-js';
import styles from './TetrisGame.module.css';

interface GameOverModalProps {
  onPlayAgain: () => void;
  buttonRef: (el: HTMLButtonElement) => void;
}

const GameOverModal: Component<GameOverModalProps> = (props) => {
  return (
    <div class={styles.gameOver}>
      <h2>Game Over</h2>
      <button
        ref={props.buttonRef}
        onClick={() => {
          console.log('Restarting game');
          props.onPlayAgain();
        }}
      >
        Play Again
      </button>
    </div>
  );
};

export default GameOverModal; 