import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import processor from "./markdownProcessor";
import Dexie from "dexie";

import markdown from "prettier/parser-markdown";
import prettier from "prettier/standalone";

const initialText = `# Markdown Editor

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

type Item = {
  raw: string;
  html: string;
  id: string;
  updatedAt: number;
};

function formatMarkdown(md: string) {
  return prettier.format(md, { parser: "markdown", plugins: [markdown] });
}

const db = new Dexie("mydb");

db.version(1).stores({
  items: "id, raw, html, updatedAt"
});

const CURRENT = "$current";

const Item = (db as any).items;

class MarkdownCompiler {
  compile(raw: string) {
    const result = processor.processSync(raw).toString();
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

  async format(raw: string): Promise<string> {
    return formatMarkdown(raw);
  }

  async getLastState(): Promise<Item> {
    const current = await Item.get(CURRENT);
    if (current) {
      return current;
    }

    const raw = initialText;
    const initialItem = {
      id: CURRENT,
      raw,
      html: processor.processSync(raw).toString(),
      updatedAt: Date.now()
    };
    await Item.put(initialItem);
    console.log("initialItem", initialItem);
    return initialItem;
  }
}

Comlink.expose(MarkdownCompiler, self);
