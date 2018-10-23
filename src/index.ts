import "@babel/polyfill";
import "github-markdown-css/github-markdown.css";

import * as Comlink from "comlinkjs";

const textarea = document.querySelector(".js-editor");
const preview = document.querySelector(".js-preview");

const MarkdownCompiler: any = Comlink.proxy(new Worker("./markdownWorker.ts"));

const main = async () => {
  const compiler = await new MarkdownCompiler();
  let isComposing = false;

  const update = async (rawValue: string) => {
    console.log("iscomposinig", isComposing);
    if (isComposing) {
      return;
    }

    console.time("compile:worker");
    const result = await compiler.compile(rawValue);
    console.timeEnd("compile:worker");

    requestAnimationFrame(() => {
      console.time("innerHTML");
      preview.innerHTML = result;
      console.timeEnd("innerHTML");
    });
  };

  if (textarea && preview) {
    textarea.addEventListener("compositionstart", async (ev: any) => {
      isComposing = true;
    });

    textarea.addEventListener("compositionend", async (ev: any) => {
      isComposing = false;
      update(ev.target.value);
    });

    textarea.addEventListener("input", async (ev: any) => {
      console.log("iscomposinig", isComposing);
      if (isComposing) {
        return;
      }

      update(ev.target.value);
    });
    const lastState = await compiler.getLastState();

    (textarea as any).value = lastState.raw;
    preview.innerHTML = lastState.html;
  }
};

main();
