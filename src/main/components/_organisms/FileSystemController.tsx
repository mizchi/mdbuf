import React, { useState, useCallback, useEffect } from "react";
import { useAppState, useDispatch } from "../../contexts/RootStateContext";
import { updateRaw } from "../../reducers";

export function FileSystemController(props: {
  editorRef: React.RefObject<any>;
  onStartHandle: Function;
  onEndHandle: Function;
}) {
  // @ts-ignore
  const canUseFs = !!window.chooseFileSystemEntries;
  return (
    <div
      style={{
        padding: 5,
        outline: "1px solid black",
        boxSizing: "border-box"
      }}
    >
      <h4>exprerimental: native file read/write</h4>
      {canUseFs ? (
        <_FileSystemController {...props} />
      ) : (
        <p>
          Plase use chrome canary (78) and enable experimental feature.
          <br />
          <a href="https://www.google.com/intl/ja/chrome/canary/">Download</a>
          <br />
          ... and open <code>chrome://flags/#native-file-system-api</code> and
          enable it.
        </p>
      )}
    </div>
  );
}

function _FileSystemController(props: {
  editorRef: React.RefObject<any>;
  onStartHandle: Function;
  onEndHandle: Function;
}) {
  const [writeHandler, setWriteHandler] = useState(null);
  const [currentFilename, setFilename] = useState<string | null>(null);
  const appState = useAppState();

  const dispatch = useDispatch();

  const onOpen = useCallback(async (_ev?: any) => {
    try {
      // @ts-ignore
      const readHandler = await window.chooseFileSystemEntries();
      const currentText = await readFile(readHandler);
      if (currentText != null) {
        dispatch(updateRaw(currentText));
        if (props.editorRef && props.editorRef.current) {
          props.editorRef.current.focus();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onSave = useCallback(
    async (_ev?: any) => {
      let w: any = writeHandler;

      if (writeHandler == null) {
        try {
          // @ts-ignore
          w = await window.chooseFileSystemEntries({
            type: "saveFile",
            accepts: [
              {
                description: "Markdown file",
                extensions: ["md"],
                mimeTypes: ["text/markdown"]
              }
            ]
          });
          setWriteHandler(w);
        } catch (err) {
          // catch abrot
          console.error("aborted", err);
          // alert("Please select file");
          return;
        }
      }

      setFilename(`${w.name}: ${Date.now()}`);
      await writeFile(w, appState.raw);
    },
    [writeHandler, appState.raw, currentFilename]
  );
  const onClickClose = useCallback(async (_ev: any) => {
    setFilename(null);
    setWriteHandler(null);
  }, []);

  // auto write
  // useEffect(() => {
  //   (async () => {
  //     if (writeHandler) {
  //       await writeFile(writeHandler, appState.raw);
  //     }
  //   })();
  // }, [appState.raw]);

  useEffect(() => {
    const keydown = (ev: any) => {
      // cmd + o
      if (ev.metaKey && ev.keyCode === 79) {
        ev.preventDefault();
        onOpen();
      }

      // cmd + s
      if (ev.metaKey && ev.keyCode === 83) {
        // FIXME: waiting for prettier...
        ev.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [writeHandler, onOpen, onSave]);

  return (
    <>
      <div>
        <button onClick={onOpen}>Open(Cmd+O)</button>
      </div>
      <div>
        <button onClick={onSave}>
          Save(Cmd+S){currentFilename && ` to ${currentFilename}`}
        </button>
        {writeHandler && <button onClick={onClickClose}>Close</button>}
      </div>
    </>
  );
}

async function readFile(handler: any): Promise<string> {
  const file = await handler.getFile();
  return await file.text();
}

async function writeFile(handler: any, text: string): Promise<void> {
  const writer = await handler.createWriter();
  await writer.truncate(0);
  await writer.write(0, text);
  await writer.close();
}
