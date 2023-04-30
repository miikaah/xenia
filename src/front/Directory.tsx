import React, { useEffect, useState } from "react";

type Dir = { path: string; name: string; children?: Dir[] };

export const Directory = () => {
  const [name, setName] = useState("root");
  const [prevName, setPrevName] = useState("root");
  const [directory, setDirectory] = useState<Dir>();

  useEffect(() => {
    fetch(`/directories/${name}`, {
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
  }, [name]);

  if (!directory) {
    return null;
  }
  console.log("prevName", prevName);

  const changeDir = (dir) => {
    if (Array.isArray(dir.children)) {
      setPrevName(name);
    }

    setName(dir.name);
  };

  return (
    <div className="directory">
      <button onClick={() => setName(prevName)}>{prevName}</button>

      {(directory.children || []).map((dir: Dir) =>
        Array.isArray(directory.children) ? (
          <button
            key={`${dir.path}-${Date.now()}`}
            onClick={() => changeDir(dir)}
          >
            {dir.name}
          </button>
        ) : (
          <a href={`/${dir.name}`}></a>
        )
      )}
    </div>
  );
};
