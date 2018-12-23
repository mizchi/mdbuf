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

import { createGlobalStyle } from "styled-components";

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

  .CodeMirror {
    height: 100vh !important;
    font-family: MonoAscii !important;

    padding-left: 20px;
    box-sizing: border-box;
    font-size: 16px;
    line-height: 1.2em;
    /* -webkit-font-smoothing: antialiased; */
  }

  .react-codemirror2 {
    height: 100vh;
  }

  .cm-variable-2 {
    color: rgb(248, 248, 232) !important;
  }

  .cm-header {
    font-weight: normal !important;
    color: rgb(128, 200, 252);
  }
`;

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
