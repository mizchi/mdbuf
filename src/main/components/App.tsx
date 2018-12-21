import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from "react";
import { BottomHelper } from "./BottomHelper";
import { Main } from "./Main";
import { State } from "../../types";

// CONSTANTS
const SHOW_PREVIEW_KEY = "show-preview";

// Global State
let focusedOnce = false;

export function App({
  proxy,
  initialState
}: {
  proxy: any;
  initialState: State;
}) {
  const editorRef: React.RefObject<HTMLTextAreaElement> = useRef(null);
  const previewContainerRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [state, setState] = useState(initialState);

  const updatePreview = useCallback(
    async (raw: String) => {
      if (editorRef.current) {
        const el = editorRef.current as HTMLTextAreaElement;
        const val = el.value;
        const line = val.substr(0, el.selectionStart).split("\n").length;
        const html = await proxy.compile({ raw, line });
        setState(s => ({
          ...s,
          html
        }));
      } else {
        const html = await proxy.compile({ raw });
        setState(s => ({
          ...s,
          html
        }));
      }
    },
    [state.raw]
  );

  // listeners
  const onChangeValue = useCallback(async (rawValue: string) => {
    const wordCount = Array.from(rawValue).length;
    setState(s => ({
      ...s,
      wordCount
    }));
    // console.time("compile:worker");
    await updatePreview(rawValue);
    // console.timeEnd("compile:worker");
    document.title = `mdbuf(${wordCount})`;
  }, []);

  const onWindowKeyDown = useCallback(
    async (ev: KeyboardEvent) => {
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

      // Ctrl+Shift+F || Cmd+S
      if (
        (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "f") ||
        (ev.metaKey && ev.key.toLowerCase() === "s")
      ) {
        ev.preventDefault();
        if (editorRef.current) {
          const raw = editorRef.current.value;
          const formatted = await proxy.format(raw);
          editorRef.current.value = formatted;
          updatePreview(formatted);
        }
      }
    },
    [Math.random()]
  );

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
    window.addEventListener("keydown", onWindowKeyDown, { passive: true });
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
      <Main
        editorRef={editorRef}
        previewContainerRef={previewContainerRef}
        html={state.html}
        raw={state.raw}
        showPreview={state.showPreview}
        onChangeValue={onChangeValue}
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
