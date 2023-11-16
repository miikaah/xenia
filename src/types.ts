import { Stats } from "fs";

export type Dir = {
  path: string;
  hash: string;
  name: string;
  stat: Stats;
  isDirectory: boolean;
  isLeafNode: boolean;
};
