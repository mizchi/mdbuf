import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRemote } from "../contexts/RemoteContext";
import { updateRaw } from "../reducers";
import { useCurrentBuffer } from "../contexts/CurrentBufferContext";

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
  return useCallback(
    async (currentText: string) => {
      const text = await remote.format(currentText);
      dispatch(updateRaw.action({ raw: text, remote }));
      if (currentBuffer) {
        const pos = currentBuffer.getCursorPosition();
        currentBuffer.setValue(text);
        currentBuffer.setCursorPosition(pos);
      }
    },
    [remote, currentBuffer]
  );
}
