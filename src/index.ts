import archiver from "archiver";
import dotenv from "dotenv";
import express, { Response } from "express";
import fsOrig from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

import { Dirent } from "fs";
import { errorHandler } from "./errorHandler";
import { app } from "./express";
import * as urlSafeBase64 from "./urlSafeBase64";
import { getAppHtml } from "./front/Main";
import { Dir } from "./types";
import { humanizeSize } from "./util";

export { app } from "./express";

dotenv.config();

const {
  PORT = 5150,
  NODE_ENV,
  XENIA_PATH = "",
  DIRECTORIES = "",
} = process.env;
const baseUrl = `http://localhost:${PORT}`;
const options = {
  root: XENIA_PATH,
};
const directories = DIRECTORIES.split(",");
const tempDirPath = `${path.join(os.tmpdir(), "xenia")}`;

const getIsLeafNode = async (directory: string) => {
  const files = await fs.readdir(directory);

  for (const file of files) {
    const stat = await fs.stat(path.join(directory, file));

    if (stat.isDirectory()) {
      return false;
    }
  }

  return true;
};

const getStats = (dir: Dirent[], directory: string): Promise<Dir>[] => {
  return dir.map(async ({ name }) => {
    const fullPath = path.join(directory, name);

    const stat = await fs.stat(fullPath);
    const isDirectory = stat.isDirectory();

    return {
      path: urlSafeBase64.encode(fullPath),
      pathAsArray: fullPath.split(path.sep),
      name,
      stat: await fs.stat(fullPath),
      isDirectory,
    };
  });
};

const padLeft = (numberToPad: number) => {
  return String(numberToPad).padStart(2, "0");
};

const getFormattedDate = (date: Date) => {
  return `${date.getFullYear()}${padLeft(date.getMonth() + 1)}${padLeft(
    date.getDate(),
  )}${padLeft(date.getHours())}${padLeft(date.getSeconds())}`;
};

const fileExists = async (filepath: string) => {
  try {
    const stats = await fs.stat(filepath);
    return stats.isFile();
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return false;
    } else {
      throw err;
    }
  }
};

const getFileSize = async (
  directoryPath: string,
  totalFilesize: number,
): Promise<number> => {
  const files = await fs.readdir(directoryPath);

  for (const file of files) {
    const dirPath = path.join(directoryPath, file);
    const stat = await fs.stat(dirPath);
    totalFilesize += stat.size;

    if (stat.isDirectory()) {
      totalFilesize = await getFileSize(dirPath, totalFilesize);
    }
  }

  return totalFilesize;
};

const compressDirectory = async (
  directoryPath: string,
  outputFilePath: string,
  res: Response,
) => {
  if (!(await directoryExists(tempDirPath))) {
    console.log(
      `\nTemporary directory ${tempDirPath} does not exists. Creating...\n`,
    );
    await fs.mkdir(tempDirPath);
  }

  console.log("Requested", directoryPath, "for archival");
  const files = await fs.readdir(directoryPath);

  let totalFilesize = await getFileSize(directoryPath, 0);
  console.log(
    "Total size of the directory",
    humanizeSize(totalFilesize),
    "bytes",
  );

  if (totalFilesize > 3_000_000_000) {
    res.status(401).json({
      error: `File size of ${humanizeSize(totalFilesize)} is too large`,
    });
    return;
  }

  const dirStats = await fs.stat(directoryPath);
  const dirModifiedAt = dirStats.mtime;
  const timestamp = getFormattedDate(dirModifiedAt);
  const outputFilename = `${path.join(
    tempDirPath,
    `${outputFilePath}.${timestamp}.${totalFilesize}`,
  )}.zip`;
  const outputFilenameForClient = `${path.join(
    tempDirPath,
    outputFilePath,
  )}.zip`;

  if (await fileExists(outputFilename)) {
    console.log("Cache hit for", outputFilename);

    res.attachment(outputFilenameForClient);
    res.sendFile(outputFilename);
    return;
  }

  await fs.writeFile(outputFilename, "");

  const archive = archiver("zip", {
    zlib: { level: 1 },
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      console.log("Got Archiver warning", err);
    } else {
      throw err;
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  const output = fsOrig.createWriteStream(outputFilename);

  output.on("close", () => {
    const stats = fsOrig.statSync(outputFilename);
    const fileSize = stats.size;
    console.log("Archive size:", humanizeSize(fileSize), "bytes\n");

    res.attachment(outputFilenameForClient);
    res.setHeader("Content-Length", fileSize);

    fsOrig.createReadStream(outputFilename).pipe(res);
  });

  archive.pipe(output);
  archive.directory(directoryPath, files.length > 1 ? false : outputFilename);
  archive.finalize();
  console.log("Archiving", outputFilename);
};

const directoryExists = async (directoryPath: string) => {
  try {
    const stats = await fs.stat(directoryPath);
    return stats.isDirectory();
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return false;
    } else {
      throw err;
    }
  }
};

const start = async () => {
  let paths: Dir[] = [];
  let dirs: Dir[] = [];

  if (!(await directoryExists(tempDirPath))) {
    console.log(
      `\nTemporary directory ${tempDirPath} does not exists. Creating...\n`,
    );
    await fs.mkdir(tempDirPath);
  }

  await Promise.all(
    directories.map(async (directory) => {
      if (!directory) {
        return;
      }

      const dirParts = directory.split(path.sep);
      const name = dirParts[dirParts.length - 1];
      const stat = await fs.stat(directory);
      const isDirectory = stat.isDirectory();

      dirs.push({
        path: directory,
        name,
        stat,
        isDirectory,
      });
    }),
  );

  await Promise.all(
    directories.map(async (directory) => {
      if (!directory) {
        return;
      }

      const stat = await fs.stat(directory);
      const isDirectory = stat.isDirectory();

      paths.push({
        path: directory,
        name: directory.replace(/^.:\//, "").split(path.sep).pop() ?? "",
        stat,
        isDirectory,
      });

      app.use(express.static(directory));
      console.log("Serving static files from", directory);
    }),
  );

  paths.sort((a, b) => a.name.localeCompare(b.name));

  const byDirFirst = (a: Dir, b: Dir) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  };

  // ROUTES

  app.get("/", (req, res) => {
    res.send(getAppHtml(paths));
  });

  app.get("/public/:filename", (req, res) => {
    const { filename } = req.params;

    res.sendFile(`public/${filename}`, options);
  });

  app.get("/download", async (req, res) => {
    const { path: pathname } = req.query;
    const pathDecoded = urlSafeBase64.decode(pathname as string);
    const dirname = pathDecoded.split(path.sep).pop();

    await compressDirectory(pathDecoded, dirname ?? "unknown", res);
  });

  app.get("/:name", async (req, res) => {
    const { name } = req.params;
    const dir = dirs.find((dir) => dir.name === name);

    if (!dir) {
      res.status(404).send("Not found");
      return;
    }

    const dirdir = await fs.readdir(dir.path, {
      withFileTypes: true,
    });
    const contents = await Promise.all(getStats(dirdir, dir.path));

    res.send(getAppHtml(paths, contents.sort(byDirFirst), "/"));
  });

  app.get("/:name/(.*)", async (req, res) => {
    const { name } = req.params;
    const dir = dirs.find((dir) => dir.name === name);

    if (!dir) {
      res.status(404).send("Not found");
      return;
    }

    const urlpath = req.url.split(name).pop();

    if (!urlpath) {
      res.status(400).send("Malformed path");
      return;
    }

    const pathname = decodeURI(urlpath);
    const basepath = path.join(dir.path, pathname);

    try {
      const dirdir = await fs.readdir(basepath, {
        withFileTypes: true,
      });
      const contents = await Promise.all(getStats(dirdir, basepath));
      const currentDirArray = pathname.split("/");
      const currentDir = currentDirArray[currentDirArray.length - 2];
      const previousUrl = req.url.replace(encodeURI(`${currentDir}/`), "");

      res.send(getAppHtml(paths, contents.sort(byDirFirst), previousUrl));
    } catch (error: any) {
      if (error.code === "ENOTDIR") {
        res.sendFile(basepath);
      } else {
        console.error("Failed during render", error);
        res.status(500).send("Internal Server Error");
      }
    }
  });

  app.use(errorHandler);

  app.listen(PORT, async () => {
    if (NODE_ENV !== "test") {
      console.log(`\n${new Date().toISOString()} Serving ${baseUrl}\n`);
    }
  });
};

start();
