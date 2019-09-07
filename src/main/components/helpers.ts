import { useCallback } from "react";
import { useDispatch } from "react-redux";

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
