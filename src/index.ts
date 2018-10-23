import "@babel/polyfill";
import "github-markdown-css/github-markdown.css";
import "katex/dist/katex.min.css";

import * as Comlink from "comlinkjs";

const textarea = document.querySelector(".js-editor");
const preview = document.querySelector(".js-preview");
const previewContainer: any = document.querySelector(".js-preview-container");

const toggle = document.querySelector(".js-preview-toggle");

const MarkdownCompiler: any = Comlink.proxy(new Worker("./markdownWorker.ts"));

const main = async () => {
  const compiler = await new MarkdownCompiler();
  let isComposing = false;

  const update = async (rawValue: string) => {
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

  if (textarea && preview && previewContainer && toggle) {
    // Toggle button
    const SHOW_PREVIEW_KEY = "show-preview";
    const val = window.localStorage.getItem(SHOW_PREVIEW_KEY);
    let showPreview: boolean = val ? JSON.parse(val) : true;

    const updatePreviweContainer = () => {
      if (showPreview) {
        previewContainer.style.display = "block";
      } else {
        previewContainer.style.display = "none";
      }
      localStorage.setItem(SHOW_PREVIEW_KEY, String(showPreview));
    };

    toggle.addEventListener("click", () => {
      showPreview = !showPreview;
      updatePreviweContainer();
    });

    window.addEventListener("keydown", ev => {
      if (ev.ctrlKey && ev.key === "1") {
        showPreview = !showPreview;
        updatePreviweContainer();
      }
    });
    updatePreviweContainer();

    // IME Skip
    textarea.addEventListener("compositionstart", async (ev: any) => {
      isComposing = true;
    });

    textarea.addEventListener("compositionend", async (ev: any) => {
      isComposing = false;

      // TODO: Ensure input and compositionend order
      update(ev.target.value);
    });

    textarea.addEventListener("input", async (ev: any) => {
      if (isComposing) {
        return;
      }

      update(ev.target.value);
    });
    const lastState = await compiler.getLastState();

    (textarea as any).value = lastState.raw;
    preview.innerHTML = lastState.html;

    (textarea as any).focus();
  }
};

main();
