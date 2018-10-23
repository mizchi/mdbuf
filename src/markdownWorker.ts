import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import processor from "./markdownProcessor";
import Dexie from "dexie";

const db = new Dexie("mydb");

db.version(1).stores({
  items: "id, raw, html, updatedAt"
});

const CURRENT = "$current";

const Item = (db as any).items;

class MarkdownCompiler {
  compile(raw: string) {
    const result = processor.processSync(raw).toString();
    // Save background
    setTimeout(async () => {
      console.time("worker:save");
      await Item.put({
        id: CURRENT,
        raw,
        html: result,
        updatedAt: Date.now()
      });
      console.timeEnd("worker:save");
    });
    return result;
  }

  async getLastState(): Promise<{
    raw: string;
    html: string;
    id: string;
    updatedAt: number;
  }> {
    try {
      const current = await Item.get(CURRENT);
      return current;
    } catch (e) {
      const raw = "# Hello!\n";
      const initialItem = {
        id: CURRENT,
        raw,
        html: processor.processSync(raw).toString(),
        updatedAt: Date.now()
      };
      await Item.put(initialItem);
      return initialItem;
    }
  }
}

Comlink.expose(MarkdownCompiler, self);
