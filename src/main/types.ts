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

export type EditorMode = "textarea" | "monaco";
export type ToolMode = "preview" | "outline" | "save" | "command" | "about";
export type AppState = {
  wordCount: number;
  raw: string;
  ast: null | any;
  showPreview: boolean;
  toolMode: ToolMode;
  editorMode: EditorMode;
  writingHandlerName?: string;
  initialized: boolean;
  toc: Array<any>;
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
