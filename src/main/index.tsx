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
import { WorkerAPIContext } from "./contexts/RemoteContext";
import { Provider as CurrentBufferProvider } from "./contexts/CurrentBufferContext";
import { Provider as WriterProvider } from "./contexts/WriterContext";
// import logger from "redux-logger";
import thunkMiddleware, { ThunkMiddleware } from "redux-thunk";
import { reducer } from "./reducers";
import { createStore, applyMiddleware, AnyAction } from "redux";

const main = async () => {
  console.time("mount");
  const thunk: ThunkMiddleware<AppState, AnyAction> = thunkMiddleware;
  const remote: WorkerAPI = await new (Proxy as any)();
  const firstState = await loadState(remote);
  const store = createStore(
    reducer,
    firstState,
    // applyMiddleware(thunk, logger),
    applyMiddleware(thunk)
  );

  ReactDOM.render(
    <WorkerAPIContext.Provider value={remote}>
      <WriterProvider>
        <CurrentBufferProvider>
          <Provider store={store}>
            <App
              proxy={remote}
              onUpdateState={newState => {
                saveState(remote, newState);
              }}
            />
          </Provider>
        </CurrentBufferProvider>
      </WriterProvider>
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
