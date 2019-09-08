// DB
export type Save = {
  id: string;
  state: string;
};

export type Item = {
  id: string;
  raw: string;
  html: string;
  updatedAt: number;
};

export type EditorMode = "textarea" | "codemirror" | "monaco";
export type ToolMode = "preview" | "outline" | "save" | "help";
export type AppState = {
  wordCount: number;
  raw: string;
  showPreview: boolean;
  toolMode: ToolMode;
  editorMode: EditorMode;
  writingHandlerName?: string;
  initialized: boolean;
  // server built state
  html: string;
  outline: Outline;
};

export type Outline = Array<{
  type: string;
  depth: number;
  start: number;
  end: number;
  children: any;
}>;

export type WorkerAPI = {
  saveCurrentState(data: AppState): Promise<void>;
  compile(data: {
    raw: string;
    line?: number;
  }): Promise<{ html: string; outline: Array<any> }>;
  getLastState(): Promise<AppState>;
  format(raw: string): Promise<string>;
  setDispatch(dispatch: any): Promise<void>;
};

export type PatchWithTimestamp = {
  value: string;
  timestamp: number;
};

export type EditorAPI = {
  getCursorPosition(): number;
  setCursorPosition(position: number): void;
  focus(): void;
  setValue(value: string): void;
  getValue(): string;
};
