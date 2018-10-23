サンプルテキストは https://qiita.com/mizchi/items/4d25bc26def1719d52e6.md

markdown のコンパイルと、 innerHTML への挿入の時間の計測

# 素朴な実装

```js
import processor from "./markdownProcessor";

const textarea = document.querySelector(".js-editor");
const preview = document.querySelector(".js-preview");

if (textarea && preview) {
  textarea.addEventListener("input", (ev: any) => {
    const raw: string = ev.target.value;
    console.time("compile");
    const result = processor.processSync(raw).toString();
    console.timeEnd("compile");

    requestAnimationFrame(() => {
      console.time("innerHTML");
      preview.innerHTML = result;
      console.timeEnd("innerHTML");
    });
  });
}
```

- compile: 28~32ms
- innerHTML: 0.8~1.2ms

# Worker で Markdown で コンパイル & IndexedDb で永続化

```js
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
```

- `worker:compile` 36.7509765625ms
- `worker:save` 2.210205078125ms
