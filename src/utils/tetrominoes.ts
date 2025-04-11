import { Tetromino, TetrominoType } from '../types/game';

export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0', // シアン
  O: '#f0f000', // イエロー
  T: '#a000f0', // パープル
  S: '#00f000', // グリーン
  Z: '#f00000', // レッド
  J: '#0000f0', // ブルー
  L: '#f0a000', // オレンジ
};

export const TETROMINO_SHAPES: Record<TetrominoType, boolean[][]> = {
  I: [
    [false, false, false, false],
    [true, true, true, true],
    [false, false, false, false],
    [false, false, false, false],
  ],
  O: [
    [true, true],
    [true, true],
  ],
  T: [
    [false, true, false],
    [true, true, true],
    [false, false, false],
  ],
  S: [
    [false, true, true],
    [true, true, false],
    [false, false, false],
  ],
  Z: [
    [true, true, false],
    [false, true, true],
    [false, false, false],
  ],
  J: [
    [true, false, false],
    [true, true, true],
    [false, false, false],
  ],
  L: [
    [false, false, true],
    [true, true, true],
    [false, false, false],
  ],
};

export const createTetromino = (type: TetrominoType): Tetromino => ({
  type,
  shape: TETROMINO_SHAPES[type],
  position: { x: 3, y: 0 }, // 初期位置はグリッドの中央上部
  color: TETROMINO_COLORS[type],
}); 