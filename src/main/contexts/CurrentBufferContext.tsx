import React, { useContext, useState, useCallback } from "react";
import { EditorAPI } from "../types";

export const CurrentBufferContext = React.createContext<{
  set: (api: EditorAPI | null) => void;
  setOffset(pos: number): void;
  api: null | EditorAPI;
  lastOffset: null | number;
}>(null as any);

export const Provider = function(props: { children: any }) {
  const [api, set] = useState<null | EditorAPI>(null);
  const [offset, setOffset] = useState<null | number>(null);

  return (
    <CurrentBufferContext.Provider
      value={{
        api,
        set,
        lastOffset: offset,
        setOffset
      }}
    >
      {props.children}
    </CurrentBufferContext.Provider>
  );
};

export const useCurrentBuffer = () => {
  return useContext(CurrentBufferContext).api;
};

export const useCurrentBufferContext = () => {
  return useContext(CurrentBufferContext);
};
