import express from "express";
import path from "path";

import { errorHandler } from "./errorHandler";
import { app } from "./express";
import { traverseFileSystem } from "./traverseFileSystem";

export { app } from "./express";

const { PORT = 5150, NODE_ENV, XENIA_PATH } = process.env;
const baseUrl = `http://localhost:${PORT}`;
const options = {
  root: XENIA_PATH,
};
const { DIRECTORIES = "" } = process.env;
const directories = DIRECTORIES.split(",");

type Dir = {
  path: string;
  name: string;
  children?: Dir[];
};

const recurseChildren = (
  parent: string,
  children: string[],
  isRoot = false
): Dir[] | undefined => {
  if (children.length === 1 || parent.endsWith(children[0])) {
    return !isRoot
      ? undefined
      : [
          {
            path: parent,
            name: children[0],
          },
        ];
  }

  const uniqChildren = Array.from(
    new Set(children.map((child) => child.split(path.sep)[0]))
  );

  const qwe = uniqChildren.reduce((acc, child) => {
    const path2 = `${parent}${path.sep}${child}`;

    return {
      ...acc,
      [child]: {
        path: path2,
        name: child,
        children: children
          .filter((c) => c.startsWith(child))
          .map((c) => c.replace(`${child}${path.sep}`, "")),
      },
    };
  }, {});

  return Object.values(qwe).map((q) => ({
    // @ts-expect-error useless
    ...q,
    // @ts-expect-error useless
    children: recurseChildren(q.path, q.children || []),
  }));
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

const start = async () => {
  let paths: Dir[] = [];

  await Promise.all(
    directories.map(async (directory) => {
      if (!directory) {
        return;
      }

      const files = await traverseFileSystem(directory);
      paths.push({
        path: directory,
        name: directory.replace(/^.:\\/, ""),
        children: recurseChildren(directory, files, true),
      });

      app.use(express.static(directory));
      console.log("Serving static files from", directory);
    })
  );

  const rootPaths = paths.reduce((acc, dir) => {
    // @ts-expect-error useless
    if (!acc.children) {
      return {
        children: [],
      };
    }

    const children = [
      // @ts-expect-error useless
      ...acc.children,
      { path: dir.path, name: dir.name },
    ];

    return {
      ...acc,
      children,
    };
  }, {});

  app.get("/directories", async (req, res) => {
    res.json(paths);
  });

  app.get("/directories/:name", async (req, res) => {
    const { name } = req.params;

    if (name === "root") {
      res.json(rootPaths);
      return;
    }

    const dir = paths.find((p) => p.name === name);

    res.json(dir);
  });

  app.get("/", (req, res) => {
    res.sendFile("dist/public/index.html", options);
  });

  app.get("/:filepath", (req, res) => {
    res.sendFile("dist/public/index.html", options);
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
      console.log(`Serving ${baseUrl}\n`);
    }
  });
};

start();
