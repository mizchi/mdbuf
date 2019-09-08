import "regenerator-runtime/runtime";
import { initialState, initialText } from "./data";
import { AppState, WorkerAPI } from "./types";
import formatMarkdown from "./helpers/formatMarkdown";
import { compile } from "./helpers/markdownProcessor";
import * as storage from "./storage";

let _dispatch: any;
export const api: WorkerAPI = {
  // Dispatch action to main thread
  async setDispatch(dispatch: any) {
    _dispatch = dispatch;
  },
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
      return { ...currentSave, initialized: true };
    }

    // ensure initial data
    // const raw = storage.initialText;
    const { html, outline } = compile(initialText);
    const initial: AppState = {
      ...initialState,
      initialized: true,
      raw: initialText,
      wordCount: Array.from(initialText).length,
      html,
      outline
    };
    return initial;
  },
  // format by prettier
  async format(raw: string): Promise<string> {
    return formatMarkdown(raw);
  }
};
