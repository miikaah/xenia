import React, { useEffect, useState } from "react";

type Stats = { size: number };
type Dir = { path: string; name: string; stat: Stats };

export const Directory = ({
  currentDirectory,
  setCurrentDirectory,
}: {
  currentDirectory?: Dir;
  setCurrentDirectory: (dir: Dir) => void;
}) => {
  const [directory, setDirectory] = useState<Dir[]>();

  useEffect(() => {
    if (!currentDirectory) {
      return;
    }

    fetch(`/directories/${currentDirectory.path}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("asd", data);
        return data;
      })
      .then(setDirectory)
      .catch(console.error);
  }, [currentDirectory]);

  if (!directory) {
    return null;
  }

  const changeDir = (dir) => {
    setCurrentDirectory(dir);
  };

  const isFile = (dir: Dir) => {
    return dir.name.includes(".") && dir.stat.size;
  };

  return (
    <div className="directory">
      {directory.map((dir: Dir) =>
        isFile(dir) ? (
          <a key={dir.path} href={`/${dir.name}?path=${dir.path}`}>
            {dir.name}
          </a>
        ) : (
          <button key={dir.path} onClick={() => changeDir(dir)}>
            {dir.name}
          </button>
        )
      )}
    </div>
  );
};
