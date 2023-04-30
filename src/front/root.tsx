import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Directory } from "./Directory";

type Stats = { size: number };
type Dir = { path: string; name: string; stat: Stats };

const App = () => {
  const [directories, setDirectories] = useState<Dir[]>();
  const [currentDirectory, setCurrentDirectory] = useState<Dir>();

  useEffect(() => {
    fetch(`/directories`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("root", data);
        return data;
      })
      .then(setDirectories)
      .catch(console.error);
  }, []);

  if (!directories) {
    return null;
  }

  return (
    <div className="main-container">
      <h2>Directories</h2>

      <div className="directories">
        {directories.map((directory) => {
          return (
            <button
              key={directory.path}
              onClick={() => setCurrentDirectory(directory)}
            >
              {directory.name}
            </button>
          );
        })}
      </div>

      <div className="right-container">
        <Directory
          currentDirectory={currentDirectory}
          setCurrentDirectory={setCurrentDirectory}
        />
      </div>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
