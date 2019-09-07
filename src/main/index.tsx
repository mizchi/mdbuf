import "regenerator-runtime/runtime";
import "github-markdown-css/github-markdown.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/default.css";

import React from "react";
import ReactDOM from "react-dom";
import Proxy from "./WorkerProxy";
import { App } from "./components/App";
import { AppState, WorkerAPI } from "../types";
import { Provider } from "react-redux";
import { WorkerAPIContext } from "./contexts/WorkerAPIContext";
import thunkMiddleware, { ThunkMiddleware } from "redux-thunk";

import { reducer } from "./reducers";
import { createStore, applyMiddleware, AnyAction } from "redux";

const main = async () => {
  console.time("mount");
  const thunk: ThunkMiddleware<AppState, AnyAction> = thunkMiddleware;
  const proxy: WorkerAPI = await new (Proxy as any)();
  const firstState = await loadState(proxy);
  const store = createStore(reducer, firstState, applyMiddleware(thunk));

  ReactDOM.render(
    <WorkerAPIContext.Provider value={proxy}>
      <Provider store={store}>
        <App
          proxy={proxy}
          onUpdateState={newState => {
            saveState(proxy, newState);
          }}
        />
      </Provider>
    </WorkerAPIContext.Provider>,

    document.querySelector("#root")
  );
  console.timeEnd("mount");
};

main();

// helpers
async function saveState(proxy: WorkerAPI, state: AppState): Promise<void> {
  proxy.saveCurrentState(state);
}

async function loadState(proxy: WorkerAPI): Promise<AppState> {
  return proxy.getLastState();
}

window.addEventListener("beforeinstallprompt", (ev: any) => {
  // e.userChoice will return a Promise.
  // For more details read: https://developers.google.com/web/fundamentals/getting-started/primers/promises
  ev.userChoice.then((choiceResult: any) => {
    console.log(choiceResult.outcome);

    if (choiceResult.outcome == "dismissed") {
      console.log("User cancelled home screen install");
    } else {
      console.log("User added to home screen");
    }
  });
});
