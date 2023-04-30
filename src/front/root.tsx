import React from "react";
import { createRoot } from "react-dom/client";
import { Directory } from "./Directory";

const App = () => {
  return (
    <div className="main-container">
      <h1>Files</h1>

      <div className="right-container">
        <Directory />
      </div>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
