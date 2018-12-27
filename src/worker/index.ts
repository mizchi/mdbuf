import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import { compile } from "./markdownProcessor";
import formatMarkdown from "./formatMarkdown";
import * as storage from "./storage";
import { AppState, Item, WorkerAPI } from "../types";

class WorkerAPIImpl implements WorkerAPI {
  async getItem(data: { id: string }): Promise<Item | void> {
    return await storage.getItem(data.id);
  }

  async getAllItems(): Promise<Item[]> {
    return await storage.getItems();
  }

  async saveItem(data: { raw: string; id: string }): Promise<void> {
    await storage.saveItem(data.id, data.raw);
  }

  async saveCurrentState(data: AppState): Promise<void> {
    await storage.saveCurrentSave(data);
    console.log("save current state in worker");
  }

  async compile(data: {
    raw: string;
    line?: number;
  }): Promise<{ html: string; outline: Array<any> }> {
    return compile(data.raw, data.line);
  }

  async getLastState(): Promise<AppState> {
    const currentSave = await storage.loadCurrentSave();
    console.log("getLastState", currentSave);
    if (currentSave) {
      console.log("existed current item");
      return currentSave;
    }

    // ensure initial data
    const raw = storage.initialText;
    const { html, outline } = compile(raw);

    const initialState: AppState = {
      raw,
      wordCount: Array.from(raw).length,
      html,
      outline,
      showPreview: true,
      toolMode: "preview",
      editorMode: "textarea"
    };
    return initialState;
  }

  // utils

  // format by prettier
  async format(raw: string): Promise<string> {
    return formatMarkdown(raw);
  }
}

Comlink.expose(WorkerAPIImpl, self);
