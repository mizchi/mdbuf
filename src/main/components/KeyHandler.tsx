import { pick } from "lodash-es";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../types";
import { useWriter } from "../contexts/WriterContext";
import * as actions from "../reducers";
import { useAction, useUpdate, useFormat } from "./helpers";
import { useCurrentBuffer } from "../contexts/CurrentBufferContext";

export function KeyHandler() {
  const buffer = useCurrentBuffer();
  const writer = useWriter();
  const update = useUpdate();
  const format = useFormat();
  const { showPreview, raw, editorMode } = useSelector((s: AppState) =>
    pick(s, ["editorMode", "showPreview", "raw"])
  );
  const updateShowPreview = useAction(actions.updateShowPreview);
  const changeEditorMode = useAction(actions.changeEditorMode);

  useEffect(() => {
    const onWindowKeyDown = async (ev: KeyboardEvent) => {
      const meta = ev.metaKey || ev.ctrlKey;
      if (meta && ev.key.toLocaleLowerCase() === "o") {
        ev.preventDefault();
        try {
          // @ts-ignore
          const readHandler = await window.chooseFileSystemEntries();
          const file = await readHandler.getFile();
          const currentText = await file.text();
          if (currentText != null) {
            update(currentText);

            buffer && buffer.setValue(currentText);
            buffer && buffer.focus();
          }
          writer.close();
        } catch (err) {
          console.log("aborted", err);
        }
      }

      // cmd + shift + s
      if (meta && ev.shiftKey && ev.key.toLocaleLowerCase() === "s") {
        ev.preventDefault();
        const handler = await writer.open(false);
        await writer.write(handler, raw);
        return;
      }

      // cmd + s
      if (meta && ev.key.toLocaleLowerCase() === "s") {
        ev.preventDefault();
        const handler = await writer.open();
        await writer.write(handler, raw);
        return;
      }

      // Ctrl+1
      if (ev.ctrlKey && ev.key === "1") {
        ev.preventDefault();
        const nextShowPreview = !showPreview;
        updateShowPreview(nextShowPreview);
        return;
      }
      // Ctrl+Shift+E
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLocaleLowerCase() === "e") {
        ev.preventDefault();
        if (editorMode === "textarea") {
          changeEditorMode("monaco");
          // } else if (editorMode === "codemirror") {
        } else if (editorMode === "monaco") {
          changeEditorMode("textarea");
        }
        return;
      }
      // Ctrl+Shift+F
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "f") {
        ev.preventDefault();
        format(raw);
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  });
  return <></>;
}
