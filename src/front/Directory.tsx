import React from "react";
import { faDownload, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dir } from "../types";
import { formatDate, humanizeSize } from "../util";

const Directory = ({
  directory,
  baseUrl,
  isXenia,
}: {
  directory: Dir[];
  baseUrl: string;
  isXenia?: boolean;
}) => {
  const upUrl = `${isXenia && baseUrl === "/" ? `/xenia${baseUrl}` : baseUrl}`;
  const downUrl = (dir: Dir) => isXenia ? `/xenia/download?path=${dir.path}` : `/download?path=${dir.path}`;

  return (
    <div className="directory">
      <div className="directory-enclosing-folder">
        <a href={upUrl}>..</a>
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
              <span title={dir.name} className="directory-dir-name">
                {dir.name}
              </span>
            </a>
            <span>{formatDate(dir.stat.mtimeMs)}</span>
            <span className="size">{humanizeSize(dir.stat.size)}</span>
            {dir.isDirectory && (
              <a
                className="button-download"
                href={downUrl(dir)}
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
