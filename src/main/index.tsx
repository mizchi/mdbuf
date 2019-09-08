import "regenerator-runtime/runtime";
import "github-markdown-css/github-markdown.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/default.css";
import React from "react";
import ReactDOM from "react-dom";
import Proxy from "./WorkerProxy";
import { App } from "./components/App";
import { AppState, WorkerAPI } from "../shared/types";
import { Provider } from "react-redux";
import { WorkerAPIContext } from "./contexts/RemoteContext";
import { Provider as CurrentBufferProvider } from "./contexts/CurrentBufferContext";
import { Provider as WriterProvider } from "./contexts/WriterContext";
import { createStore } from "../shared/store/createStore";

const main = async () => {
  console.time("mount");
  const remote: WorkerAPI = await new (Proxy as any)();
  const store = await createStore(remote);

  ReactDOM.render(
    <WorkerAPIContext.Provider value={remote}>
      <WriterProvider>
        <CurrentBufferProvider>
          <Provider store={store}>
            <App />
          </Provider>
        </CurrentBufferProvider>
      </WriterProvider>
    </WorkerAPIContext.Provider>,

    document.querySelector("#root")
  );
  console.timeEnd("mount");
};

main();
