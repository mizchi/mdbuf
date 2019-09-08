import "regenerator-runtime/runtime";
import { AppState, WorkerAPI } from "./types";
import formatMarkdown from "./helpers/formatMarkdown";
import { compile } from "./helpers/markdownProcessor";
import * as storage from "./storage";

export const api: WorkerAPI = {
  async saveCurrentState(data: AppState): Promise<void> {
    await storage.saveToCurrent(data);
  },

  async compile(data: {
    raw: string;
    line?: number;
  }): Promise<{ html: string; outline: Array<any> }> {
    return compile(data.raw, data.line);
  },

  async getLastState(): Promise<AppState> {
    const currentSave = await storage.loadCurrentSave();
    if (currentSave) {
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
  },

  // format by prettier
  async format(raw: string): Promise<string> {
    return formatMarkdown(raw);
  }
};
