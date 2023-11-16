import React from "react";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dir } from "../types";
import { formatDate, humanizeSize } from "../util";

const Directory = ({
  directory,
  baseUrl,
}: {
  directory: Dir[];
  baseUrl: string;
}) => {
  return (
    <div className="directory">
      <div>
        <a href={baseUrl}>..</a>
      </div>
      {directory.map((dir: Dir) => {
        return (
          <div className="directory-wrapper" key={dir.path}>
            <a href={`${dir.name}${dir.isDirectory ? "/" : ""}`}>{dir.name}</a>
            <span>{formatDate(dir.stat.mtimeMs)}</span>
            <span className="size">{humanizeSize(dir.stat.size)}</span>
            {dir.isDirectory && (
              <a
                className="button-download"
                href={`/download?path=${dir.path}`}
              >
                <FontAwesomeIcon icon={faDownload} />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Directory;
