import { Component } from 'solid-js';
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: Component<ScoreDisplayProps> = (props) => {
  return (
    <div class={styles.score}>
      <span class={styles.scoreLabel}>Score</span>
      <span class={styles.scoreValue}>{props.score}</span>
    </div>
  );
};

export default ScoreDisplay; 