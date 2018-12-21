import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import processor from "./markdownProcessor";
import formatMarkdown from "./formatMarkdown";
import * as storage from "./storage";
import { Item } from "../types";

export class WorkerAPI {
  async compile(data: { raw: string; line?: number }): Promise<string> {
    // background update
    storage.saveCurrent(data.raw);
    // inject selected hint
    (global as any).__remark_cursor_line = data.line;
    return processor.processSync(data.raw).toString();
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

Comlink.expose(WorkerAPI, self);
