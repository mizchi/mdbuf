import "@babel/polyfill";
import "github-markdown-css/github-markdown.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/default.css";

import Proxy from "./lib/WorkerProxy";
import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from "react";
import ReactDOM from "react-dom";
import { BottomHelper } from "./components/BottomHelper";
import { Main } from "./components/Main";

// CONSTANTS
const SHOW_PREVIEW_KEY = "show-preview";

// Global State
let proxy: any = null;
let focusedOnce = false;

type State = {
  loaded: boolean;
  wordCount: number;
  raw: string;
  html: string;
  showPreview: boolean;
};

const initialState: State = {
  raw: "",
  html: "",
  wordCount: 0,
  loaded: false,
  showPreview: true
};

function App() {
  const editorRef: React.RefObject<HTMLTextAreaElement> = useRef(null);
  const previewContainerRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [state, setState] = useState(initialState);

  const updatePreview = useCallback(
    async (raw: String) => {
      if (editorRef.current) {
        const el = editorRef.current as HTMLTextAreaElement;
        const val = el.value;
        const lineNo = val.substr(0, el.selectionStart).split("\n").length;
        const html = await proxy.compile({ raw, lineNo });
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
    // init proxy
    if (proxy == null && !state.loaded) {
      (async () => {
        const val = window.localStorage.getItem(SHOW_PREVIEW_KEY);
        let showPreview: boolean = val ? JSON.parse(val) : true;
        proxy = await new Proxy();
        const lastState = await proxy.getLastState();
        setState({
          showPreview,
          wordCount: Array.from(lastState.raw).length,
          raw: lastState.raw,
          html: lastState.html,
          loaded: true
        });
      })();
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  });

  useLayoutEffect(() => {
    if (state.loaded && editorRef.current && !focusedOnce) {
      focusedOnce = true;
      editorRef.current.focus();
    }
  });

  // Show loading message at first
  if (!state.loaded) {
    return (
      <div style={{ padding: 18 }}>
        <span style={{ color: "white" }}>Loading...</span>
      </div>
    );
  }

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

ReactDOM.render(<App />, document.querySelector("#root"));
