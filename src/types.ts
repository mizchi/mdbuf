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
export type ToolMode = "preview" | "outline" | "help" | "recorder" | "share";
export type AppState = {
  wordCount: number;
  raw: string;
  showPreview: boolean;
  toolMode: ToolMode;
  editorMode: EditorMode;
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
  getItem(data: { id: string }): Promise<Item | void>;

  getAllItems(): Promise<Item[]>;

  saveItem(data: { raw: string; id: string }): Promise<void>;

  saveCurrentState(data: AppState): Promise<void>;

  compile(data: {
    raw: string;
    line?: number;
  }): Promise<{ html: string; outline: Array<any> }>;

  getLastState(): Promise<AppState>;

  // utils
  // format by prettier
  format(raw: string): Promise<string>;
};
