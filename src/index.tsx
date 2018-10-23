import processor from "./markdownProcessor";

const textarea = document.querySelector(".js-editor");
const preview = document.querySelector(".js-preview");

if (textarea && preview) {
  textarea.addEventListener("input", (ev: any) => {
    const raw: string = ev.target.value;
    const result = processor.processSync(raw).toString();
    preview.innerHTML = result;
  });
}
