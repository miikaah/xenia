import dotenv from "dotenv";
import express from "express";
import fs from "fs/promises";
import path from "path";

import { Dirent, Stats } from "fs";
import { errorHandler } from "./errorHandler";
import { app } from "./express";
import * as urlSafeBase64 from "./urlSafeBase64";

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

type Dir = {
  path: string;
  name?: string;
  stat?: Stats;
};

let dirs: Dir[] = [];
directories.map(async (directory) => {
  if (!directory) {
    return;
  }

  const dirParts = directory.split(path.sep);
  const name = dirParts[dirParts.length - 1];

  dirs.push({ path: directory, name });
});

const getStats = (dir: Dirent[], pathDecoded: string) => {
  return dir.map(async ({ name }) => {
    const fullPath = `${pathDecoded}${path.sep}${name}`;

    return {
      path: urlSafeBase64.encode(`${pathDecoded}${path.sep}${name}`),
      name,
      stat: await fs.stat(fullPath),
    };
  });
};

const start = async () => {
  let paths: Dir[] = [];

  await Promise.all(
    directories.map(async (directory) => {
      if (!directory) {
        return;
      }

      paths.push({
        path: urlSafeBase64.encode(directory),
        name: directory.replace(/^.:\//, "").split("/").pop(),
        stat: await fs.stat(directory),
      });

      app.use(express.static(directory));
      console.log("Serving static files from", directory);
    })
  );

  app.get("/directories", async (req, res) => {
    res.json(paths);
  });

  app.get("/directories/:pathname", async (req, res) => {
    const { pathname } = req.params;
    const pathEntry = paths.find((p) => p.path === pathname);

    if (!pathEntry) {
      const pathDecoded = urlSafeBase64.decode(pathname);
      const dir = await fs.readdir(pathDecoded, {
        withFileTypes: true,
      });

      if (!dir) {
        res.status(404).send();
        return;
      }

      const dirs = await Promise.all(getStats(dir, pathDecoded));

      res.json(dirs.sort((a, b) => a.stat.size - b.stat.size));
      return;
    }

    const pathDecoded = urlSafeBase64.decode(pathEntry.path);
    const dir = await fs.readdir(pathDecoded, {
      withFileTypes: true,
    });
    const dirs = await Promise.all(getStats(dir, pathDecoded));

    res.json(dirs.sort((a, b) => a.stat.size - b.stat.size));
  });

  app.get("/", (req, res) => {
    res.sendFile(path.join(XENIA_PATH, "dist/public/index.html"));
  });

  app.get("/:filename", (req, res) => {
    const { filename } = req.params;

    if (!filename || filename === "favicon.ico") {
      res.end();
      return;
    }

    const { path } = req.query;
    // @ts-expect-error stfu
    const pathDecoded = urlSafeBase64.decode(path ?? "");

    res.sendFile(pathDecoded);
  });

  app.get("/public/:filename", (req, res) => {
    const { filename } = req.params;

    if (filename === "root.js") {
      res.sendFile(`dist/root.js`, options);
      return;
    }

    res.sendFile(`dist/public/${filename}`, options);
  });

  app.use(errorHandler);

  app.listen(PORT, async () => {
    if (NODE_ENV !== "test") {
      console.log(`\n${new Date().toISOString()} Serving ${baseUrl}\n`);
    }
  });
};

start();
