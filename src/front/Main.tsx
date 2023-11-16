import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dir } from "../types";
import Directory from "./Directory";

const App = ({
  directories,
  contents,
  baseUrl,
}: {
  directories: Dir[];
  contents?: Dir[];
  baseUrl?: string;
}) => {
  return (
    <div className="main-container">
      <h2>
        <a href="/">Directories</a>
      </h2>

      <div className="directories">
        {directories.map((directory, i) => {
          return (
            <a key={i} href={`/${directory.hash}/`}>
              {directory.name}
            </a>
          );
        })}
      </div>

      {Array.isArray(contents) && contents.length && baseUrl && (
        <div className="right-container">
          <Directory directory={contents} baseUrl={baseUrl} />
        </div>
      )}
    </div>
  );
};

export const getAppHtml = (
  directories: Dir[],
  contents?: Dir[],
  baseUrl?: string,
) => {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <title>Xenia</title>
      <link rel="stylesheet" type="text/css" href="/public/styles.css" />
    </head>

    <body>
      ${renderToStaticMarkup(
        <App directories={directories} contents={contents} baseUrl={baseUrl} />,
      )}
    </body>
  </html>
 `;
};
