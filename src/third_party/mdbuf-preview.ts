import * as Comlink from "comlink";
// @ts-ignore
import Worker from "./mdbuf-preview.w";

customElements.define(
  "mdbuf-preview",
  class extends HTMLElement {
    async connectedCallback() {
      console.log("xxx");
      const worker = new Worker();
      const api = Comlink.wrap(worker) as any;
      const text = this.textContent as string;
      const md = await api.compile(text);
      this.innerHTML = md;
    }
  }
);
