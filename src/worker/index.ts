import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import { compile } from "./markdownProcessor";
import formatMarkdown from "./formatMarkdown";
import * as storage from "./storage";
import { Item } from "../types";

export class WorkerAPI {
  async compile(data: { raw: string; line?: number }): Promise<string> {
    storage.saveCurrent(data.raw);
    return compile(data.raw, data.line).html;
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
