import "@babel/polyfill";
import "github-markdown-css/github-markdown.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/default.css";

import React from "react";
import ReactDOM from "react-dom";
import Proxy from "./WorkerProxy";
import { App } from "./components/App";
import { AppState } from "../types";
import { WorkerAPI } from "../worker";
import { Provider } from "./contexts/RootStateContext";

// CONSTANTS
const SHOW_PREVIEW_KEY = "$mdbuf-state";

async function saveState(proxy: WorkerAPI, state: AppState): Promise<void> {
  const partialState: AppState = {
    showPreview: state.showPreview,
    wordCount: state.wordCount,
    toolMode: state.toolMode,
    editorMode: state.editorMode,
    // they are heavy
    raw: "",
    outline: [],
    html: ""
  };

  // TODO: Save on background worker
  const seriarized = JSON.stringify(partialState);
  localStorage.setItem(SHOW_PREVIEW_KEY, seriarized);
}

async function loadFullData(proxy: WorkerAPI): Promise<AppState> {
  let persisited: any = null;
  try {
    const stateStr: string | null = window.localStorage.getItem(
      SHOW_PREVIEW_KEY
    );
    persisited = JSON.parse(stateStr as any);
    if (!(persisited instanceof Object)) {
      throw new Error("legacy state");
    }
  } catch (e) {
    persisited = {
      showPreview: true,
      toolMode: "preview",
      editorMode: "textarea",

      // no
      wordCount: 0,
      raw: "",
      outline: [],
      html: ""
    };
  }

  const lastState = await proxy.getLastState();

  return {
    ...persisited,
    ...lastState,
    wordCount: Array.from(lastState.raw).length
  };
}

const main = async () => {
  const proxy: WorkerAPI = await new (Proxy as any)();
  const initialState = await loadFullData(proxy);

  ReactDOM.render(
    <Provider reducer={t => t} initialState={initialState}>
      <App
        proxy={proxy}
        initialState={initialState}
        onUpdateState={newState => {
          console.log("save state");
          saveState(proxy, newState);
        }}
      />
    </Provider>,

    document.querySelector("#root")
  );
};

main();
