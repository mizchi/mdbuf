import React, { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { BottomHelper } from "./elements/BottomHelper";
import { Main } from "./Main";
import { AppState } from "../../types";
import { WorkerAPI } from "../../types";
import { createGlobalStyle } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { KeyHandler } from "./KeyHandler";

import { changeToolMode, updateRaw, updateShowPreview } from "../reducers";

// Global State
let focusedOnce = false;

export function App({
  proxy,
  onUpdateState
}: {
  proxy: WorkerAPI;
  onUpdateState: (s: AppState) => void;
}) {
  const state = useSelector((s: AppState) => s);
  const dispatch = useDispatch();
  const editorRef: React.RefObject<HTMLTextAreaElement> = useRef(null);
  const previewContainerRef: React.RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => onUpdateState(state), [
    state.showPreview,
    state.toolMode,
    state.editorMode,
    state.raw,
    state.html,
    state.outline
  ]);

  const onChangeToolMode = useAction(changeToolMode);

  // const onSelectOutlineHeading = useCallback((start: number) => {
  //   if (editorRef.current) {
  //     editorRef.current.selectionStart = start;
  //     editorRef.current.selectionEnd = start;
  //     editorRef.current.focus();
  //   }
  // }, []);

  const onWheel = useCallback((ev: any) => {
    if (ev.ctrlKey) {
      ev.preventDefault();
      if (previewContainerRef.current) {
        const scrollTop = previewContainerRef.current.scrollTop;
        previewContainerRef.current.scrollTop = scrollTop + ev.deltaY;
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (!focusedOnce && editorRef.current) {
      focusedOnce = true;
      editorRef.current.focus();
    }
  }, []);

  return (
    <>
      <GlobalStyle />
      <KeyHandler />
      <Main
        editorRef={editorRef}
        previewContainerRef={previewContainerRef}
        onChangeToolMode={onChangeToolMode}
        onWheel={onWheel}
      />
      <BottomHelper
        wordCount={state.wordCount}
        onClick={() => {
          dispatch(updateShowPreview(!state.showPreview));
        }}
      />
    </>
  );
}

const GlobalStyle = createGlobalStyle`
  .markdown-body { 
    padding: 10px;
    line-height: 1.3em;
  }

  .cursor-focused {
    background-color: rgba(255, 128, 128, 0.2);
  }

  ::-webkit-scrollbar {
    width: 7px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(128, 128, 128, 0.5);
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.5);
  }
`;

function useAction<T extends Function>(action: T, keys: Array<any> = []): T {
  const dispatch = useDispatch();
  // @ts-ignore
  return useCallback((...args: any) => {
    return dispatch(action(...args));
  }, keys);
}
