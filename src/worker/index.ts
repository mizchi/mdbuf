import * as Comlink from "comlink";
import "regenerator-runtime/runtime";
import { AppState, WorkerAPI } from "../shared/types";
import formatMarkdown from "./formatMarkdown";
import { compile } from "./markdownProcessor";
import * as storage from "./storage";

class WorkerAPIImpl implements WorkerAPI {
  async saveCurrentState(data: AppState): Promise<void> {
    await storage.saveToCurrent(data);
    // console.log("save current state in worker");
  }

  async compile(data: {
    raw: string;
    line?: number;
  }): Promise<{ html: string; outline: Array<any> }> {
    return compile(data.raw, data.line);
  }

  async getLastState(): Promise<AppState> {
    const currentSave = await storage.loadCurrentSave();
    // console.log("getLastState", currentSave);
    if (currentSave) {
      // console.log("existed current item");
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

Comlink.expose(WorkerAPIImpl);
