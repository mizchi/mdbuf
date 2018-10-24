import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import processor from "./lib/markdownProcessor";
import formatMarkdown from "./lib/formatMarkdown";
import * as storage from "./lib/storage";
import { Item } from "./types";

class MarkdownCompiler {
  compile(raw: string) {
    // background update
    storage.saveCurrent(raw);
    return processor.processSync(raw).toString();
  }

  async format(raw: string): Promise<string> {
    return formatMarkdown(raw);
  }

  async getLastState(): Promise<Item> {
    const current = await storage.loadCurrent();
    if (current) {
      console.log("existed current item");
      return current;
    }
    // ensure initial data
    const raw = storage.initialText;
    await storage.saveCurrent(raw);
    return storage.loadCurrent();
  }
}

Comlink.expose(MarkdownCompiler, self);
