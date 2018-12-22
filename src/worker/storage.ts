import Dexie from "dexie";
import { ItemWithOutline } from "../types";
import { compile } from "./markdownProcessor";

const db = new Dexie("mydb");

db.version(1).stores({
  items: "id, raw, html, updatedAt"
});

const CURRENT = "$current";

const Items = (db as any).items;

export async function loadCurrent(): Promise<ItemWithOutline> {
  const item = await Items.get(CURRENT);
  // debugger;
  try {
    const ret = compile(item.raw);
    return { ...item, outline: ret.outline };
  } catch (e) {
    return {
      raw: initialText,
      html: "...",
      outline: [],
      id: CURRENT,
      updatedAt: Date.now()
    };
  }
}

export async function saveCurrent(raw: string): Promise<void> {
  await Items.put({
    id: CURRENT,
    raw,
    html: compile(raw).html,
    updatedAt: Date.now()
  });
}

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
