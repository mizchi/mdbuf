import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRemote } from "../contexts/RemoteContext";
import { updateRaw } from "../reducers";

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
