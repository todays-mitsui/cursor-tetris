import { Component, Show } from 'solid-js';
import { Tetromino } from '../types/game';
import styles from './TetrisGame.module.css';

interface NextPiecePreviewProps {
  nextTetromino: () => Tetromino | undefined;
}

const NextPiecePreview: Component<NextPiecePreviewProps> = (props) => {
  return (
    <div class={styles.nextPiece}>
      <h3>Next Piece</h3>
      <div class={styles.nextPiecePreview}>
        <Show when={props.nextTetromino()}>
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
  );
};

export default NextPiecePreview; 