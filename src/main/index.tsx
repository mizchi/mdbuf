import "@babel/polyfill";
import "github-markdown-css/github-markdown.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/default.css";

import React from "react";
import ReactDOM from "react-dom";
import Proxy from "./WorkerProxy";
import { App } from "./components/App";
import { State } from "../types";
import { WorkerAPI } from "../worker";

// CONSTANTS
const SHOW_PREVIEW_KEY = "$mdbuf-state";

async function saveState(proxy: WorkerAPI, state: State): Promise<void> {
  const partialState: State = {
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

async function loadFullData(proxy: WorkerAPI): Promise<State> {
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
    <App
      proxy={proxy}
      initialState={initialState}
      onUpdateState={newState => {
        console.log("save state");
        saveState(proxy, newState);
      }}
    />,
    document.querySelector("#root")
  );
};

main();
