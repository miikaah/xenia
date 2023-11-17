import React from "react";
import { faDownload, faFolder } from "@fortawesome/free-solid-svg-icons";
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
      <div className="directory-enclosing-folder">
        <a href={baseUrl}>..</a>
      </div>
      {directory.map((dir: Dir) => {
        return (
          <div className="directory-wrapper" key={dir.path}>
            <a
              className={`${
                dir.isDirectory ? "directory-dir-link" : "directory-file-link"
              }`}
              href={`${dir.name}${dir.isDirectory ? "/" : ""}`}
            >
              <span>
                {dir.isDirectory && <FontAwesomeIcon icon={faFolder} />}
              </span>
              <span className="directory-dir-name">{dir.name}</span>
            </a>
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
