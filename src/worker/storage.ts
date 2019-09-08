import Dexie from "dexie";
import { AppState, Item, Save } from "../shared/types";
import { compile } from "./markdownProcessor";
import { ulid } from "ulid";
import { sortBy } from "lodash-es";

export const CURRENT_ITEM_KEY = "$current";
export const CURRENT_SAVE_KEY = "$current-save";

const db = new Dexie("mydb");

db.version(2).stores({
  saves: "id, state",
  items: "id, raw, html, updatedAt"
});

const Items: Dexie.Table<Item, any> = (db as any).items;
const Saves: Dexie.Table<Save, any> = (db as any).saves;

export async function saveToCurrent(state: AppState): Promise<void> {
  await Saves.put({
    id: CURRENT_SAVE_KEY,
    state: JSON.stringify(state)
  });
}

export async function saveNewItem(raw: string): Promise<void> {
  await Items.put({
    id: ulid(),
    raw,
    html: compile(raw).html,
    updatedAt: Date.now()
  });
}

export async function deleteItem(id: string): Promise<void> {
  await Items.delete(id);
}

export async function loadCurrentSave(): Promise<AppState | void> {
  const save = await Saves.get(CURRENT_SAVE_KEY);
  if (save != null) {
    return JSON.parse(save.state);
  }
  return undefined;
}

export async function saveItem(id: string, raw: string): Promise<void> {
  await Items.put({
    id,
    raw,
    html: compile(raw).html,
    updatedAt: Date.now()
  });
}

export async function getItem(id: string): Promise<Item | void> {
  return Items.get(id);
}

export async function getItems(): Promise<Item[]> {
  const items = await Items.toArray();
  return items.filter(t => t.id !== CURRENT_ITEM_KEY);
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
