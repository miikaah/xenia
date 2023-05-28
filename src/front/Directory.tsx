import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Dir } from "./types";

export const Directory = ({
  currentDirectory,
  setCurrentDirectory,
  goToPreviousDirectory,
}: {
  currentDirectory?: Dir;
  setCurrentDirectory: (dir: Dir) => void;
  goToPreviousDirectory: () => void;
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
      .then(async (response) => response.json())
      .then(setDirectory)
      .catch(console.error);
  }, [currentDirectory]);

  if (!directory || !currentDirectory) {
    return null;
  }

  const changeDir = (dir: Dir) => {
    setCurrentDirectory(dir);
  };

  const humanizeSize = (size: number) => {
    if (size < 1_000_000_000) {
      if (size < 1_000_000) {
        if (size < 1000) {
          return `${size} B`;
        }

        return `${(size / 1000).toFixed(0)} kB`;
      }

      return `${(size / 1_000_000).toFixed(0)} MB`;
    }

    return `${(size / 1_000_000_000).toFixed(0)} GB`;
  };

  const handleDownloadClick = (dir: Dir) => {
    window.location.href = `/download?path=${dir.path}`;
  };

  return (
    <div className="directory">
      <div>
        <button
          onClick={() => {
            setDirectory(undefined);
            goToPreviousDirectory();
          }}
        >
          ..
        </button>
      </div>
      {directory.map((dir: Dir) => (
        <div className="directory-wrapper" key={dir.path}>
          {!dir.isDirectory ? (
            <a href={`/${dir.name}?path=${dir.path}`}>{dir.name}</a>
          ) : (
            <button onClick={() => changeDir(dir)}>{dir.name}</button>
          )}
          <span>{new Date(dir.stat.mtimeMs).toLocaleDateString()}</span>
          <span className="size">{humanizeSize(dir.stat.size)}</span>
          {dir.isDirectory && (
            <button
              className="button-download"
              onClick={() => handleDownloadClick(dir)}
            >
              <FontAwesomeIcon icon={faDownload} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
