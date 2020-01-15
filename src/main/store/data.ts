import { AppState } from "../types";
export const initialText = `# Markdown Buffer

- Desktop PWA Support
- Autosave
- Off Thread Markdown Compiling

## Markdown

**emphasis** ~~strike~~ _italic_

> Quote

\`\`\`js
// code highlight
class Foo {
  constructor() {
    console.log("xxx");
  }
}
\`\`\`

## Math by KaTeX

$ y = x^3 + 2ax^2 + b $
`;

export const initialState: AppState = {
  raw: "",
  wordCount: 0,
  html: "",
  outline: [],
  showPreview: true,
  initialized: false,
  toolMode: "preview",
  editorMode: "textarea"
};
