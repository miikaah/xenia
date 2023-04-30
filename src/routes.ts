import express from "express";
import path from "path";

import { app } from "./express";

const { DIRECTORIES = "" } = process.env;

DIRECTORIES.split(",").forEach((directory) => {
  if (!directory) {
    return;
  }

  const dirParts = directory.split(path.sep);
  const dirName = dirParts[dirParts.length - 1];

  app.use(express.static(directory));
  console.log("Serving static files from", directory);
});
