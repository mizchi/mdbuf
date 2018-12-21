import Dexie from "dexie";
import { Item } from "../types";
import processor from "./markdownProcessor";

const db = new Dexie("mydb");

db.version(1).stores({
  items: "id, raw, html, updatedAt"
});

const CURRENT = "$current";

const Items = (db as any).items;

export function loadCurrent(): Promise<Item> {
  return Items.get(CURRENT);
}

export async function saveCurrent(raw: string): Promise<void> {
  await Items.put({
    id: CURRENT,
    raw,
    html: processor.processSync(raw).toString(),
    updatedAt: Date.now()
  });
}

export const initialText = `# Markdown Buffer

- Desktop PWA Support
- Autosave
- Off Thread Markdown Compile

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
