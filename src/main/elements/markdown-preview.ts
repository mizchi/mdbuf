// WIP
class MarkdownPreview extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    console.log("connected");
  }
}

customElements.define("markdown-preview", MarkdownPreview);
