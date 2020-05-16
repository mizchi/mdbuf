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
  { html: string; outline: any }
>("updateRaw", async ({ raw, line }) => {
  markdownCompiler = markdownCompiler ?? (await new MarkdownCompiler());
  return await markdownCompiler.compile(raw, line);
});

export const reducer = reducerWithoutInitialState<AppState>()
  .case(updateRaw.async.started, (state, { raw }) => {
    return {
      ...state,
      raw,
      wordCount: Array.from(raw).length,
    };
  })
  .case(updateRaw.async.done, (state, { result }) => {
    return {
      ...state,
      ...result,
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
