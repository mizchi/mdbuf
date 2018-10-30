import "@babel/polyfill";
import "./env";
import Proxy from "./lib/WorkerProxy";
import React, { SyntheticEvent } from "react";
import ReactDOM from "react-dom";

const useState: <T>(
  t: T
) => [T, (prev: T | ((t: T) => T)) => void] = (React as any).useState;

const useEffect: (f: () => void) => void = (React as any).useEffect;
const useLayoutEffect: (f: () => void) => void = (React as any).useLayoutEffect;
const useCallback: <T>(f: T, args?: Array<any>) => T = (React as any)
  .useCallback;
const useRef: (ref: any) => { current: null | any } = (React as any).useRef;

// CONSTANTS
const SHOW_PREVIEW_KEY = "show-preview";
const TAB_STR = "  ";

// Global State
let proxy: any = null;
let isComposing = false;
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
  const previewRef: React.RefObject<HTMLDivElement> = useRef(null);
  const previewContainerRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [state, setState] = useState(initialState);

  const updatePreview = useCallback(
    async (raw: String) => {
      const result = await proxy.compile(raw);
      setState(s => ({
        ...s,
        html: result
      }));
    },
    [state.raw]
  );

  // listeners

  const onChangeValue = useCallback(
    async (ev: SyntheticEvent<HTMLTextAreaElement>) => {
      if (isComposing) {
        return;
      }
      const rawValue = (ev.target as any).value;
      setState(s => ({
        ...s,
        wordCount: Array.from(rawValue).length
      }));

      console.time("compile:worker");
      await updatePreview(rawValue);
      console.timeEnd("compile:worker");
    }
  );

  const onWindowKeyDown = useCallback(async (ev: KeyboardEvent) => {
    if (ev.ctrlKey && ev.key === "1") {
      ev.preventDefault();
      localStorage.setItem(SHOW_PREVIEW_KEY, String(!state.showPreview));
      setState(s => ({ ...s, showPreview: !state.showPreview }));
      return;
    }

    if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "f") {
      ev.preventDefault();
      if (editorRef.current) {
        const raw = editorRef.current.value;
        const formatted = await proxy.format(raw);
        editorRef.current.value = formatted;
        updatePreview(formatted);
      }
    }
  });

  const onWheel = useCallback((ev: any) => {
    if (ev.ctrlKey) {
      ev.preventDefault();
      if (previewContainerRef.current) {
        const scrollTop = previewContainerRef.current.scrollTop;
        previewContainerRef.current.scrollTop = scrollTop + ev.deltaY;
      }
    }
  });

  const onTextareaKeydown = useCallback((e: KeyboardEvent) => {
    // Tab Indent
    if (e.keyCode === 9 && !isComposing) {
      e.preventDefault();
      const el: HTMLTextAreaElement = e.target as any;
      let start: number = el.selectionStart;
      let end: number = el.selectionEnd;
      const raw = el.value;
      const lineStart = raw.substr(0, start).split("\n").length - 1;
      const lineEnd = raw.substr(0, end).split("\n").length - 1;
      const lines = raw.split("\n");
      lines.forEach((line, i) => {
        if (i < lineStart || i > lineEnd || lines[i] === "") {
          return;
        }
        if (!e.shiftKey) {
          // Insert tab at head
          lines[i] = TAB_STR + line;
          start += i == lineStart ? TAB_STR.length : 0;
          end += TAB_STR.length;
        } else if (lines[i].substr(0, TAB_STR.length) === TAB_STR) {
          // Delete tab at head
          lines[i] = lines[i].substr(TAB_STR.length);
          start -= i == lineStart ? TAB_STR.length : 0;
          end -= TAB_STR.length;
        }
      });
      const newRaw = lines.join("\n");
      el.value = newRaw;
      el.setSelectionRange(start, end);
      updatePreview(newRaw);
    }
  });

  const onCompositionStart = useCallback(() => {
    isComposing = true;
  });

  const onCompositionEnd = useCallback(
    (ev: SyntheticEvent<HTMLTextAreaElement>) => {
      isComposing = false;
      onChangeValue(ev);
    }
  );

  // hooks

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

  if (state.loaded) {
    useLayoutEffect(() => {
      if (editorRef.current && !focusedOnce) {
        focusedOnce = true;
        editorRef.current.focus();
      }
    });
  }

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
      <div style={{ flex: 1, height: "100vh" }}>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "960px",
              marginLeft: "auto",
              marginRight: "auto",
              paddingTop: "8px"
            }}
          >
            <textarea
              ref={editorRef}
              className="js-editor editor"
              spellCheck={false}
              defaultValue={state.raw}
              onChange={onChangeValue}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={onCompositionEnd}
              onKeyDown={onTextareaKeydown as any}
              onWheel={onWheel as any}
            />
          </div>
        </div>
      </div>
      {state.showPreview && (
        <div
          ref={previewContainerRef}
          style={{
            flex: 1,
            height: "100vh",
            overflowY: "auto",
            background: "#eee"
          }}
        >
          <div style={{ overflowY: "auto" }}>
            <div
              ref={previewRef}
              className="markdown-body"
              style={{ padding: "10px", lineHeight: "1.3em" }}
              dangerouslySetInnerHTML={{ __html: state.html }}
            />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", right: "20px", bottom: "20px" }}>
        <span style={{ fontFamily: "monospace", color: "cornflowerblue" }}>
          {state.wordCount}
        </span>
        &nbsp;
        <button
          onClick={() => {
            localStorage.setItem(SHOW_PREVIEW_KEY, String(!state.showPreview));
            setState(s => ({ ...s, showPreview: !state.showPreview }));
          }}
        >
          👀
        </button>
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
