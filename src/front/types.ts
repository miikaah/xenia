export type Stats = { size: number, mtimeMs: number };
export type Dir = {
  path: string;
  name: string;
  stat: Stats;
  isDirectory: boolean;
  isLeafNode: boolean;
};