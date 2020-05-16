import "regenerator-runtime/runtime";
import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/default.css";
import "katex/dist/katex.min.css";
import "prism-themes/themes/prism-a11y-dark.css";

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "./store/createStore";
import { App } from "./components/App";
import { Provider as CurrentBufferProvider } from "./contexts/CurrentBufferContext";
import { Provider as WriterProvider } from "./contexts/WriterContext";

const el = document.querySelector("#root") as HTMLElement;

const timeoutId = setTimeout(() => {
  el.innerHTML = `<p style="color: white; padding-left: 30px;">
Now Loading...<br />
If you can not load, try Right Click > Inspect > Application > Clear
Site Data
</p>`;
}, 3000);

const main = async () => {
  console.time("mount");
  const store = createStore();

  clearTimeout(timeoutId);
  ReactDOM.render(
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      * {
        box-sizing: border-box;
      }
      .markdown-body pre {
        background: black;
        color: white;
      }
    `,
        }}
      />
      <WriterProvider>
        <CurrentBufferProvider>
          <Provider store={store}>
            <App />
          </Provider>
        </CurrentBufferProvider>
      </WriterProvider>
    </>,
    document.querySelector("#root")
  );
  console.timeEnd("mount");
};

main();
