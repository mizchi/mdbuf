import { pick } from "lodash-es";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../types";
import { useWorkerAPI } from "../contexts/WorkerAPIContext";
import * as actions from "../reducers";
import { useAction } from "./helpers";

export function KeyHandler({ editorRef }: { editorRef: React.RefObject<any> }) {
  const api = useWorkerAPI();
  const { showPreview, raw, editorMode } = useSelector((s: AppState) =>
    pick(s, ["editorMode", "showPreview", "raw"])
  );
  const onFormatValue = useAction(
    (raw: string) => {
      return actions.formatRaw.action({ raw, api, ref: editorRef });
    },
    [raw, editorRef]
  );
  const updateShowPreview = useAction(actions.updateShowPreview);
  const changeEditorMode = useAction(actions.changeEditorMode);

  useEffect(() => {
    const onWindowKeyDown = async (ev: KeyboardEvent) => {
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
          changeEditorMode("codemirror");
        } else if (editorMode === "codemirror") {
          changeEditorMode("textarea");
        }
        return;
      }
      // Ctrl+Shift+F || Cmd+S
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "f") {
        ev.preventDefault();
        onFormatValue(raw);
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  });
  return <></>;
}
