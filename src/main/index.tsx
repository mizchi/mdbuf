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
const SHOW_PREVIEW_KEY = "show-preview";

async function loadData(proxy: WorkerAPI): Promise<State> {
  const val = window.localStorage.getItem(SHOW_PREVIEW_KEY);
  let showPreview: boolean = val ? JSON.parse(val) : true;
  const lastState = await proxy.getLastState();

  return {
    showPreview,
    outline: lastState.outline,
    wordCount: Array.from(lastState.raw).length,
    raw: lastState.raw,
    html: lastState.html,
    toolMode: "preview"
  };
}

const main = async () => {
  const proxy: WorkerAPI = await new (Proxy as any)();
  const initialState = await loadData(proxy);

  ReactDOM.render(
    <App proxy={proxy} initialState={initialState} />,
    document.querySelector("#root")
  );
};

main();
