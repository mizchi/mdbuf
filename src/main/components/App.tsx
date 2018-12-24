import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useReducer
} from "react";
import { BottomHelper } from "./BottomHelper";
import { Main } from "./Main";
import { AppState, EditorMode } from "../../types";
import { WorkerAPI } from "../../worker";
import { createGlobalStyle } from "styled-components";
import { useAppState } from "../contexts/RootStateContext";

// CONSTANTS
const SHOW_PREVIEW_KEY = "show-preview";

// Global State
let focusedOnce = false;

export function App({
  proxy,
  initialState,
  onUpdateState
}: {
  proxy: WorkerAPI;
  initialState: AppState;
  onUpdateState: (s: AppState) => void;
}) {
  const editorRef: React.RefObject<HTMLTextAreaElement> = useRef(null);
  const previewContainerRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [state, setState] = useState(initialState);

  useEffect(
    () => {
      onUpdateState(state);
    },
    [state.showPreview, state.toolMode, state.editorMode]
  );

  const updatePreview = useCallback(
    async (raw: string) => {
      if (editorRef.current) {
        const el = editorRef.current as HTMLTextAreaElement;
        const val = el.value;
        const line = val.substr(0, el.selectionStart).split("\n").length;
        const ret = await proxy.compile({ raw, line });
        setState(s => ({
          ...s,
          html: ret.html,
          outline: ret.outline
        }));
      } else {
        const ret = await proxy.compile({ raw });
        setState(s => ({
          ...s,
          html: ret.html,
          outline: ret.outline
        }));
      }
    },
    [state.raw]
  );

  const onChangeValue = useCallback(async (rawValue: string) => {
    const wordCount = Array.from(rawValue).length;
    setState(s => ({
      ...s,
      raw: rawValue,
      wordCount
    }));
    // console.time("compile:worker");
    await updatePreview(rawValue);
    // console.timeEnd("compile:worker");
    document.title = `mdbuf(${wordCount})`;
  }, []);

  const onChangeEditorMode = useCallback(async (editorMode: EditorMode) => {
    setState(s => ({
      ...s,
      editorMode
    }));
  }, []);

  const onChangeToolMode = useCallback(toolMode => {
    setState(s => ({ ...s, toolMode }));
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
        localStorage.setItem(SHOW_PREVIEW_KEY, String(nextShowPreview));
        setState(s => ({
          ...s,
          showPreview: nextShowPreview
        }));
        return;
      }

      // Ctrl+Shift+E
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLocaleLowerCase() === "e") {
        ev.preventDefault();
        if (state.editorMode === "textarea") {
          onChangeEditorMode("codemirror");
        } else if (state.editorMode === "codemirror") {
          onChangeEditorMode("monaco");
        } else if (state.editorMode === "monaco") {
          onChangeEditorMode("textarea");
        }

        return;
      }

      // Ctrl+Shift+F || Cmd+S
      if (
        (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "f") ||
        (ev.ctrlKey && ev.key.toLowerCase() === "s") ||
        (ev.metaKey && ev.key.toLowerCase() === "s")
      ) {
        ev.preventDefault();
        const formatted = await proxy.format(state.raw);
        setState(s => ({ ...s, raw: formatted }));

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
          localStorage.setItem(SHOW_PREVIEW_KEY, String(!state.showPreview));
          setState(s => ({
            ...s,
            showPreview: !state.showPreview
          }));
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
