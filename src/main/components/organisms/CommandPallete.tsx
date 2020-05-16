import { pick } from "lodash-es";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../reducers";
import { AppState } from "../../types";
import { useWriter } from "../../contexts/WriterContext";
import { useFormat, useOpenFile } from "../_hooks/commands";
import { AppInstallButton } from "../elements/AppInstallButton";
// @ts-ignore
const canUseFs = !!window.chooseFileSystemEntries;

export function CommandPalette() {
  // const state = useSelector((s: AppState) => s);
  const selectMonaco = useCallback(
    () => dispatch(actions.changeEditorMode("monaco")),
    []
  );
  const selectTexteditor = useCallback(
    () => dispatch(actions.changeEditorMode("textarea")),
    []
  );

  const writer = useWriter();
  const format = useFormat();
  const dispatch = useDispatch();
  const { raw, showPreview, editorMode } = useSelector((s: AppState) =>
    pick(s, ["raw", "showPreview", "editorMode"])
  );
  const openFile = useOpenFile();

  const togglePreview = useCallback(async () => {
    dispatch(actions.updateShowPreview(!showPreview));
  }, [showPreview]);

  const save = useCallback(async () => {
    const handler = await writer.open();
    await writer.write(handler, raw);
  }, [writer, raw]);

  const saveAs = useCallback(async () => {
    const handler = await writer.open(false);
    await writer.write(handler, raw);
  }, [writer, raw]);

  const close = useCallback(async () => {
    await writer.close();
  }, [writer]);

  return (
    <>
      <div style={{ padding: 10 }}>
        <div>
          <h4>UI</h4>
          <button onClick={togglePreview}>Toggle toolbar(Ctrl+1)</button>
        </div>

        <div>
          <h4>Editor</h4>
          <button
            disabled={editorMode === "textarea"}
            onClick={selectTexteditor}
          >
            texteditor
          </button>
          <button disabled={editorMode === "monaco"} onClick={selectMonaco}>
            monaco
          </button>
        </div>

        <div>
          <h4>Prettier</h4>
          <button onClick={format}>Format(Ctrl+Shift+F)</button>
        </div>

        <h4>File</h4>
        {!canUseFs ? (
          <div
            style={{
              padding: "4px 2px",
              outline: "1px solid black",
              boxSizing: "border-box",
            }}
          >
            <strong>Exprerimental: Use native file systems</strong>
            <p>
              {`To use native fs, use Chrome Canary (78>=).`}&nbsp;
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
                  background: "wheat",
                }}
                // style={{ padding: 5, background: "wheat" }}
              >
                chrome://flags/#native-file-system-api
              </code>{" "}
              . Enable it!
            </p>
          </div>
        ) : (
          <>
            <button onClick={openFile}>Open(Meta+O)</button>
            <br />
            <button onClick={save}>
              Save(Meta+S)
              {writer && writer.handler && <> to {writer.handler.name}</>}
            </button>
            {writer.handler && <button onClick={close}>Close</button>}
            <br />
            <button onClick={saveAs}>Save as ...(Meta+Shift+S)</button>
          </>
        )}

        <div>
          <h4>PWA</h4>
          <AppInstallButton />
        </div>
      </div>
    </>
  );
}
