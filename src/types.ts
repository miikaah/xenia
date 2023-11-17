import { Stats } from "fs";

export type Dir = {
  path: string;
  name: string;
  stat: Stats;
  isDirectory: boolean;
};
