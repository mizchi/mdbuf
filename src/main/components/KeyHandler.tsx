import { pick } from "lodash-es";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../shared/reducers";
import { AppState } from "../../shared/types";
import { useWriter } from "../contexts/WriterContext";
import { useAction, useFormat, useOpenFile } from "./_hooks/commands";
import { useCurrentBuffer } from "../contexts/CurrentBufferContext";

export function KeyHandler() {
  const writer = useWriter();
  const format = useFormat();
  const openFile = useOpenFile();
  const buffer = useCurrentBuffer();
  const { showPreview, raw, editorMode, toolMode, outline } = useSelector(
    (s: AppState) =>
      pick(s, ["editorMode", "showPreview", "raw", "toolMode", "outline"])
  );
  const updateShowPreview = useAction(actions.updateShowPreview);
  const changeEditorMode = useAction(actions.changeEditorMode);
  const dispatch = useDispatch();

  useEffect(() => {
    const onWindowKeyDown = async (ev: KeyboardEvent) => {
      const meta = ev.metaKey || ev.ctrlKey;
      if (meta && ev.key.toLocaleLowerCase() === "o") {
        ev.preventDefault();
        openFile();
      }
      // cmd + shift + ↓
      if (meta && ev.shiftKey && ev.key === "ArrowDown") {
        ev.preventDefault();
        if (buffer) {
          const cur = buffer.getCursorPosition();
          console.log(cur);
          const m = Math.min(
            ...outline
              .map(o => o.start)
              .concat([Array.from(raw).length])
              .filter(s => s > cur)
          );
          buffer.setCursorPosition(m);
        }
        return;
      }
      // cmd + shift + ↑
      if (meta && ev.shiftKey && ev.key === "ArrowUp") {
        ev.preventDefault();
        if (buffer) {
          const cur = buffer.getCursorPosition();
          console.log(cur);
          const m = Math.max(
            ...outline
              .map(o => o.start)
              .concat([Array.from(raw).length])
              .filter(s => s < cur)
          );
          console.log("max", m);
          buffer.setCursorPosition(m);
        }
        return;
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
        if (toolMode !== "preview") {
          updateShowPreview(true);
        } else {
          updateShowPreview(!showPreview);
        }

        dispatch(actions.changeToolMode("preview"));
        return;
      }

      // Ctrl+2
      if (ev.ctrlKey && ev.key === "2") {
        ev.preventDefault();
        updateShowPreview(true);
        dispatch(actions.changeToolMode("outline"));
        return;
      }
      // Ctrl+3
      if (ev.ctrlKey && ev.key === "3") {
        ev.preventDefault();
        updateShowPreview(true);
        dispatch(actions.changeToolMode("command"));
        return;
      }
      // Ctrl+3
      if (ev.ctrlKey && ev.key === "4") {
        ev.preventDefault();
        updateShowPreview(true);
        dispatch(actions.changeToolMode("about"));
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
        format();
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [buffer, writer.handler, raw, editorMode, toolMode, outline, showPreview]);
  return <></>;
}
