import "@babel/polyfill";
import "./env";
import Proxy from "./lib/WorkerProxy";
import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  useLayoutEffect
} from "react";
import ReactDOM from "react-dom";
import { EditableGrid, GridArea, Windowed, GridData } from "react-unite";
import { Textarea } from "./components/Textarea";
import { BottomHelper } from "./components/BottomHelper";

const rows = ["1fr"];
const columns = ["1fr", "1fr"];
const areas = [["editor", "preview"]];

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
  grid: GridData;
};

const initialState: State = {
  raw: "",
  html: "",
  wordCount: 0,
  loaded: false,
  showPreview: true,
  grid: {
    rows,
    columns,
    areas
  }
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
  const onChangeValue = useCallback(async (rawValue: string) => {
    const wordCount = Array.from(rawValue).length;
    setState(s => ({
      ...s,
      wordCount
    }));
    console.time("compile:worker");
    await updatePreview(rawValue);
    console.timeEnd("compile:worker");
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
          showPreview: nextShowPreview,
          grid: {
            ...s.grid,
            areas: nextShowPreview
              ? [["editor", "preview"]]
              : [["editor", "editor"]]
          }
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
          loaded: true,
          grid: {
            rows,
            columns,
            areas: showPreview
              ? [["editor", "preview"]]
              : [["editor", "editor"]]
          }
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
      <Windowed>
        {(width, height) => {
          return (
            <EditableGrid
              width={width}
              height={height}
              spacerSize={3}
              rows={state.grid.rows}
              columns={state.grid.columns}
              areas={state.grid.areas}
              showCrossPoint={false}
              onChangeGridData={grid => {
                setState(s => ({ ...s, grid }));
              }}
            >
              <GridArea name="editor">
                <div
                  style={{
                    width: "100%",
                    maxWidth: "960px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingTop: "8px"
                  }}
                >
                  <Textarea
                    ref={editorRef}
                    raw={state.raw}
                    onChangeValue={onChangeValue}
                    onWheel={onWheel}
                  />
                </div>
              </GridArea>
              {state.showPreview && (
                <GridArea name="preview">
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
                </GridArea>
              )}
            </EditableGrid>
          );
        }}
      </Windowed>
      <BottomHelper
        wordCount={state.wordCount}
        onClick={() => {
          localStorage.setItem(SHOW_PREVIEW_KEY, String(!state.showPreview));
          setState(s => ({
            ...s,
            showPreview: !state.showPreview,
            grid: {
              ...s.grid,
              areas: state.showPreview
                ? [["editor", "preview"]]
                : [["editor", "editor"]]
            }
          }));
        }}
      />
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
