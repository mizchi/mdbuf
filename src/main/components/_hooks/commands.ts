import { MarkdownFormatter } from "../../api/formatter.worker";
import { sendGA } from "./../../utils";
import { AppState } from "../../types";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateRaw } from "../../reducers";
import { useCurrentBuffer } from "../../contexts/CurrentBufferContext";
import { useWriter } from "../../contexts/WriterContext";

export function useOpenFile() {
  const update = useUpdate();
  const currentBuffer = useCurrentBuffer();
  const writer = useWriter();
  return async () => {
    sendGA("send", "event", "command", "openFile");
    try {
      // @ts-ignore
      const readHandler = await window.chooseFileSystemEntries();
      const file = await readHandler.getFile();
      const currentText = await file.text();
      if (currentText != null) {
        update(currentText);
        if (currentBuffer) {
          currentBuffer.setValue(currentText);
          currentBuffer.focus();
        }
      }
      writer.close();
    } catch (err) {
      console.log("aborted", err);
    }
  };
}

export function useAction<T extends Function>(
  action: T,
  keys: Array<any> = []
): T {
  const dispatch = useDispatch();
  // @ts-ignore
  return useCallback((...args: any) => {
    return dispatch(action(...args));
  }, keys);
}

export function useUpdate() {
  const dispatch = useDispatch();
  return useCallback(async (currentText: string) => {
    dispatch(updateRaw.action({ raw: currentText }));
  }, []);
}

let formatter: MarkdownFormatter;
export function useFormat() {
  const dispatch = useDispatch();
  const currentBuffer = useCurrentBuffer();
  const raw = useSelector((s: AppState) => s.raw);
  return useCallback(async () => {
    sendGA("send", "event", "command", "format");
    formatter = formatter ?? (await new MarkdownFormatter());

    const text = await formatter.format(raw);
    dispatch(updateRaw.action({ raw: text }));
    if (currentBuffer) {
      const pos = currentBuffer.getCursorPosition();
      currentBuffer.setValue(text);
      currentBuffer.setCursorPosition(pos);
    }
  }, [currentBuffer, raw]);
}
