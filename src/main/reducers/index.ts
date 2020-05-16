import { MarkdownCompiler } from "../../main/api/markdownProcessor.worker";
import actionCreatorFactory from "typescript-fsa";
import { reducerWithoutInitialState } from "typescript-fsa-reducers";
import { asyncFactory } from "typescript-fsa-redux-thunk";
import { AppState, EditorMode, ToolMode } from "../types";

const actionCreator = actionCreatorFactory();
const asyncCreator = asyncFactory(actionCreator);

export const changeToolMode = actionCreator<ToolMode>("change-tool-mode");

export const changeEditorMode = actionCreator<EditorMode>("change-editor-mode");

export const updateShowPreview = actionCreator<boolean>("update-show-preview");

export const sync = actionCreator<Partial<AppState>>("sync");

let markdownCompiler: MarkdownCompiler;
export const updateRaw = asyncCreator<
  { raw: string; line?: number },
  { toc: Array<any>; ast: any; frontmatter: any }
>(
  "updateRaw",
  async ({ raw, line }): Promise<any> => {
    markdownCompiler = markdownCompiler ?? (await new MarkdownCompiler());
    return markdownCompiler.compile(raw, line);
  }
);

export const reducer = reducerWithoutInitialState<AppState>()
  .case(updateRaw.async.started, (state, payload) => {
    return {
      ...state,
      raw: payload.raw,
      wordCount: Array.from(payload.raw).length,
    };
  })
  .case(updateRaw.async.done, (state, { result }) => {
    return {
      ...state,
      ast: result.ast,
      toc: result.toc,
    };
  })
  .case(sync, (state, other) => {
    return {
      ...state,
      ...other,
    };
  })
  .case(updateShowPreview, (state, showPreview) => {
    return { ...state, showPreview };
  })
  .case(changeToolMode, (state, toolMode) => {
    const isSameMode = state.toolMode === toolMode;
    return {
      ...state,
      toolMode,
      showPreview: !(state.showPreview && isSameMode),
    };
  })
  .case(changeEditorMode, (state, editorMode) => {
    return { ...state, editorMode };
  });
