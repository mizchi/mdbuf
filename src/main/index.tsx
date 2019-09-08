import "regenerator-runtime/runtime";
import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/default.css";
import "katex/dist/katex.min.css";
import { wrap } from "comlink";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "../shared/store/createStore";
import { WorkerAPI } from "../shared/types";
import { App } from "./components/App";
import { Provider as CurrentBufferProvider } from "./contexts/CurrentBufferContext";
import { WorkerAPIContext } from "./contexts/RemoteContext";
import { Provider as WriterProvider } from "./contexts/WriterContext";

const main = async () => {
  console.time("mount");
  const worker = new Worker("../worker/index.ts", { type: "module" });
  const remote: WorkerAPI = wrap(worker);
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
