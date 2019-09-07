import React, { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { BottomHelper } from "./BottomHelper";
import { Main } from "./Main";
import { AppState } from "../../types";
import { WorkerAPI } from "../../types";
import { createGlobalStyle } from "styled-components";
import { useAppState, useDispatch } from "../contexts/RootStateContext";
import {
  changeToolMode,
  updateHtmlAndOutline,
  updateRaw,
  changeEditorMode,
  updateShowPreview
} from "../reducers";

// Global State
let focusedOnce = false;

export function App({
  proxy,
  // initialState,
  onUpdateState
}: {
  proxy: WorkerAPI;
  onUpdateState: (s: AppState) => void;
}) {
  const state = useAppState();
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

  const updatePreview = useCallback(
    async (raw: string) => {
      dispatch(updateRaw(raw));
      if (editorRef.current) {
        const el = editorRef.current as HTMLTextAreaElement;

        const line = el.value.substr(0, el.selectionStart).split("\n").length;
        const ret = await proxy.compile({ raw, line });
        dispatch(
          updateHtmlAndOutline({
            html: ret.html,
            outline: ret.outline
          })
        );
      } else {
        const ret = await proxy.compile({ raw });
        dispatch(
          updateHtmlAndOutline({
            html: ret.html,
            outline: ret.outline
          })
        );
      }
    },
    [state.raw]
  );

  const onChangeValue = useCallback(async (rawValue: string) => {
    await updatePreview(rawValue);
    requestAnimationFrame(() => {
      const wordCount = Array.from(rawValue).length;
      document.title = `mdbuf(${wordCount})`;
    });
  }, []);

  const onChangeToolMode = useCallback(toolMode => {
    dispatch(changeToolMode(toolMode));
  }, []);

  const onSelectOutlineHeading = useCallback((start: number) => {
    if (editorRef.current) {
      editorRef.current.selectionStart = start;
      editorRef.current.selectionEnd = start;
      editorRef.current.focus();
    }
  }, []);

  const onWheel = useCallback((ev: any) => {
    if (ev.ctrlKey) {
      ev.preventDefault();
      if (previewContainerRef.current) {
        const scrollTop = previewContainerRef.current.scrollTop;
        previewContainerRef.current.scrollTop = scrollTop + ev.deltaY;
      }
    }
  }, []);

  useEffect(() => {
    const onWindowKeyDown = async (ev: KeyboardEvent) => {
      // Ctrl+1
      if (ev.ctrlKey && ev.key === "1") {
        ev.preventDefault();
        const nextShowPreview = !state.showPreview;
        dispatch(updateShowPreview(nextShowPreview));
        return;
      }

      // Ctrl+Shift+E
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLocaleLowerCase() === "e") {
        ev.preventDefault();
        // if (state.editorMode === "textarea") {
        //   dispatch(changeEditorMode("codemirror"));
        // } else if (state.editorMode === "codemirror") {
        //   dispatch(changeEditorMode("monaco"));
        // } else if (state.editorMode === "monaco") {
        //   dispatch(changeEditorMode("textarea"));
        // }
        if (state.editorMode === "textarea") {
          dispatch(changeEditorMode("codemirror"));
        } else if (state.editorMode === "codemirror") {
          dispatch(changeEditorMode("textarea"));
        }

        return;
      }

      // Ctrl+Shift+F || Cmd+S
      if (
        ev.ctrlKey &&
        ev.shiftKey &&
        ev.key.toLowerCase() === "f"
        // (ev.ctrlKey && ev.key.toLowerCase() === "s") ||
        // (ev.metaKey && ev.key.toLowerCase() === "s")
      ) {
        ev.preventDefault();
        const formatted = await proxy.format(state.raw);
        updatePreview(formatted);

        // focus
        if (editorRef.current) {
          const start = editorRef.current.selectionStart;
          editorRef.current.value = formatted;
          editorRef.current.selectionStart = start;
          editorRef.current.selectionEnd = start;
          updatePreview(formatted);
        }
      }
    };

    window.addEventListener("keydown", onWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  });

  useLayoutEffect(() => {
    if (!focusedOnce && editorRef.current) {
      focusedOnce = true;
      editorRef.current.focus();
    }
  }, []);

  return (
    <>
      <GlobalStyle />
      <Main
        editorRef={editorRef}
        previewContainerRef={previewContainerRef}
        html={state.html}
        raw={state.raw}
        outline={state.outline}
        toolMode={state.toolMode}
        editorMode={state.editorMode}
        showPreview={state.showPreview}
        onChangeToolMode={onChangeToolMode}
        onChangeValue={onChangeValue}
        onSelectOutlineHeading={onSelectOutlineHeading}
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
