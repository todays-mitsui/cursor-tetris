import { Component } from 'solid-js';
import styles from './TetrisGame.module.css';

const ControlsGuide: Component = () => {
  return (
    <div class={styles.controls}>
      <h3>操作方法</h3>
      <ul class={styles.controlsList}>
        <li><kbd>←</kbd> 左に移動</li>
        <li><kbd>→</kbd> 右に移動</li>
        <li><kbd>↓</kbd> 下に移動</li>
        <li><kbd>↑</kbd> 一番下まで落とす</li>
        <li><kbd>Space</kbd> 右に90度回転</li>
        <li><kbd>Shift+Space</kbd> 左に90度回転</li>
      </ul>
    </div>
  );
};

export default ControlsGuide; 