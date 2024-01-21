import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dir } from "../types";
import Directory from "./Directory";

const App = ({
  directories,
  contents,
  baseUrl,
  isXenia
}: {
  directories: Dir[];
  contents?: Dir[];
  baseUrl?: string;
  isXenia?: boolean;
}) => {
  return (
    <div className="main-container">
      <h2>
        <a href={`${isXenia ? "/xenia" : "/"}`}>Directories</a>
      </h2>

      <div className="directories">
        {directories.map((directory, i) => {
          return (
            <a key={i} href={`/${directory.name}/`}>
              {directory.name.replace("xenia/", "")}
            </a>
          );
        })}
      </div>

      {Array.isArray(contents) && contents.length && baseUrl && (
        <div className="right-container">
          <Directory directory={contents} baseUrl={baseUrl} isXenia={isXenia} />
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
  const isXenia = directories[0].name.startsWith("xenia");

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <title>Xenia</title>
      <link rel="stylesheet" type="text/css" href="${isXenia ? "/xenia" : ""}/public/styles.css" />
    </head>

    <body>
      ${renderToStaticMarkup(
        <App directories={directories} contents={contents} baseUrl={baseUrl} isXenia={isXenia} />,
      )}
    </body>
  </html>
 `;
};
