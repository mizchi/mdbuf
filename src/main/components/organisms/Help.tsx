import React from "react";
import { AppInstallButton } from "../elements/AppInstallButton";
// @ts-ignore
const canUseFs = !!window.chooseFileSystemEntries;

export const Help = React.memo(() => {
  return (
    <div style={{ padding: 10 }}>
      {canUseFs && (
        <div
          style={{
            padding: "4px 2px",
            outline: "1px solid black",
            boxSizing: "border-box"
          }}
        >
          <strong>Exprerimental: Use native file systems</strong>
          <p>
            To use native fs, use Chrome Canary (78>=).&nbsp;
            <a
              target="_blank"
              href="https://www.google.com/intl/ja/chrome/canary/"
            >
              Download
            </a>
            <br />
            ... and Open{" "}
            <code
              style={{
                width: "95%",
                fontSize: "1.2em",
                padding: 3,
                background: "wheat"
              }}
              // style={{ padding: 5, background: "wheat" }}
            >
              chrome://flags/#native-file-system-api
            </code>{" "}
            . Enable it!
          </p>
        </div>
      )}

      <AppInstallButton />

      <dl>
        <dt>Meta + O</dt>
        <dd>(Native FS) Open file</dd>

        <dt>Meta + S</dt>
        <dd>(Native FS) Save file</dd>

        <dt>Meta + Shift + S</dt>
        <dd>(Native FS) Save file as ...</dd>

        <dt>Ctrl-1</dt>
        <dd>Toggle Preview</dd>

        <dt>Ctrl-Shift-E</dt>
        <dd>Switch editor-mode</dd>

        <dt>Ctrl-Shfit-F</dt>
        <dd>Run prettier</dd>
      </dl>
    </div>
  );
});
