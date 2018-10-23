import "@babel/polyfill";
import * as Comlink from "comlinkjs";

const textarea = document.querySelector(".js-editor");
const preview = document.querySelector(".js-preview");

const MarkdownCompiler: any = Comlink.proxy(new Worker("./markdownWorker.ts"));

const main = async () => {
  const compiler = await new MarkdownCompiler();

  if (textarea && preview) {
    textarea.addEventListener("input", async (ev: any) => {
      const raw: string = ev.target.value;
      console.time("compile:worker");
      const result = await compiler.compile(raw);
      console.timeEnd("compile:worker");

      requestAnimationFrame(() => {
        console.time("innerHTML");
        preview.innerHTML = result;
        console.timeEnd("innerHTML");
      });
    });
  }
};

main();
