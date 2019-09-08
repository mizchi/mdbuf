import { AppState } from "./../../../shared/types";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRemote } from "../../contexts/RemoteContext";
import { updateRaw } from "../../../shared/reducers";
import { useCurrentBuffer } from "../../contexts/CurrentBufferContext";
import { useWriter } from "../../contexts/WriterContext";

export function useOpenFile() {
  const update = useUpdate();
  const currentBuffer = useCurrentBuffer();
  const writer = useWriter();
  return async () => {
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
  const remote = useRemote();
  const dispatch = useDispatch();
  return useCallback(
    async (currentText: string) => {
      dispatch(updateRaw.action({ raw: currentText, remote }));
    },
    [remote]
  );
}

export function useFormat() {
  const remote = useRemote();
  const dispatch = useDispatch();
  const currentBuffer = useCurrentBuffer();
  const raw = useSelector((s: AppState) => s.raw);
  return useCallback(async () => {
    const text = await remote.format(raw);
    dispatch(updateRaw.action({ raw: text, remote }));
    if (currentBuffer) {
      const pos = currentBuffer.getCursorPosition();
      currentBuffer.setValue(text);
      currentBuffer.setCursorPosition(pos);
    }
  }, [remote, currentBuffer]);
}
