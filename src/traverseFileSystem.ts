import fs from "fs/promises";
import path, { sep } from "path";

const satisfiesConstraints = (filename: string) => {
  return !filename.startsWith(".");
};

const recursivelyBuildFileList = async (
  filepath: string,
  srcPath: string
): Promise<string[]> => {
  const dir = await fs.readdir(filepath, {
    withFileTypes: true,
  });

  let files: string[] = [];
  for (const file of dir) {
    const fullFilepath = path.join(filepath, file.name);

    if (file.isDirectory()) {
      files = files.concat(
        await recursivelyBuildFileList(fullFilepath, srcPath)
      );
    } else if (satisfiesConstraints(file.name)) {
      files.push(fullFilepath.replace(path.join(srcPath, sep), ""));
    }
  }

  return files;
};

export const traverseFileSystem = async (
  srcPath: string
): Promise<string[]> => {
  return recursivelyBuildFileList(srcPath, srcPath);
};
