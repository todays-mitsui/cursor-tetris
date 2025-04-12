import { Component } from 'solid-js';
import { Cell } from '../types/game';
import { GameState } from '../types/game';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  gameState: () => GameState;
}

const GameBoard: Component<GameBoardProps> = (props) => {
  const getCellColor = (cell: Cell, row: number, col: number): string => {
    const state = props.gameState();
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

    return cell.color || '#222';
  };

  return (
    <div class={styles.gameBoard}>
      {props.gameState().grid.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <div
            class={`${styles.cell} ${cell.filled ? styles.filled : ''}`}
            style={{ "background-color": getCellColor(cell, rowIndex, colIndex) }}
          />
        ))
      ))}
    </div>
  );
};

export default GameBoard; 