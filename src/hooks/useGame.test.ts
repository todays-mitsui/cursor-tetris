import { describe, it, expect } from 'vitest';
import { Cell } from '../types/game';
import { removeLines } from './useGame';

const GRID_WIDTH = 3; // テスト用に小さいグリッドを使用

const createTestGrid = (rows: boolean[][]): Cell[][] => {
  return rows.map(row =>
    row.map(filled => ({ filled, color: filled ? 'red' : undefined }))
  );
};

describe('removeLines', () => {
  it('1行消去のテスト', () => {
    // 3x3のテストグリッドを作成
    const grid = createTestGrid([
      [false, false, false],
      [true, true, true],   // この行が消える
      [false, true, false],
    ]);

    const expected = createTestGrid([
      [false, false, false], // 新しく追加された空の行
      [false, false, false],
      [false, true, false],
    ]);

    const result = removeLines(grid, [1]);
    expect(result).toEqual(expected);
  });

  it('複数行消去のテスト', () => {
    const grid = createTestGrid([
      [false, false, false],
      [true, true, true],   // この行が消える
      [true, true, true],   // この行も消える
      [false, true, false],
    ]);

    const expected = createTestGrid([
      [false, false, false], // 新しく追加された空の行
      [false, false, false], // 新しく追加された空の行
      [false, false, false],
      [false, true, false],
    ]);

    const result = removeLines(grid, [1, 2]);
    expect(result).toEqual(expected);
  });

  it('行が消えた後のグリッドの高さが維持されているかテスト', () => {
    const grid = createTestGrid([
      [false, false, false],
      [true, true, true],
      [false, true, false],
    ]);

    const result = removeLines(grid, [1]);
    expect(result.length).toBe(grid.length);
  });

  it('空の配列が渡された場合、グリッドが変更されないことをテスト', () => {
    const grid = createTestGrid([
      [false, false, false],
      [true, false, true],
      [false, true, false],
    ]);

    const result = removeLines(grid, []);
    expect(result).toEqual(grid);
  });

  it('不正な行インデックスが渡された場合のテスト', () => {
    const grid = createTestGrid([
      [false, false, false],
      [true, true, true],
      [false, true, false],
    ]);

    const result = removeLines(grid, [5]); // 存在しない行インデックス
    expect(result.length).toBe(grid.length);
  });
}); 