import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Directory } from "./Directory";
import { Dir } from "./types";

const App = () => {
  const [directories, setDirectories] = useState<Dir[]>();
  const [currentDirectory, setCurrentDirectory] = useState<Dir>();
  const [previousDirectories, setPreviousDirectories] = useState<Dir[]>([]);

  useEffect(() => {
    fetch(`/directories`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => response.json())
      .then(setDirectories)
      .catch(console.error);
  }, []);

  if (!directories) {
    return null;
  }

  const changeDirectory = (dir: Dir, resetDirectories?: boolean) => {
    setCurrentDirectory(dir);

    if (resetDirectories) {
      setPreviousDirectories([]);
      return;
    }

    if (currentDirectory) {
      setPreviousDirectories([...previousDirectories, currentDirectory]);
    }
  };

  const goToPreviousDirectory = () => {
    const previousDirectory =
      previousDirectories[previousDirectories.length - 1];

    setCurrentDirectory(previousDirectory);
    setPreviousDirectories(previousDirectories.slice(0, -1));
  };

  return (
    <div className="main-container">
      <h2>Directories</h2>

      <div className="directories">
        {directories.map((directory) => {
          return (
            <button
              key={directory.path}
              onClick={() => changeDirectory(directory, true)}
            >
              {directory.name}
            </button>
          );
        })}
      </div>

      <div className="right-container">
        <Directory
          currentDirectory={currentDirectory}
          setCurrentDirectory={changeDirectory}
          goToPreviousDirectory={goToPreviousDirectory}
        />
      </div>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
