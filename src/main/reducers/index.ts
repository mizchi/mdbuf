import actionCreatorFactory from "typescript-fsa";
import { reducerWithoutInitialState } from "typescript-fsa-reducers";
import { AppState, ToolMode, EditorMode, ShareState } from "../../types";

const actionCreator = actionCreatorFactory();

export const changeToolMode = actionCreator<ToolMode>("change-tool-mode");

export const changeEditorMode = actionCreator<EditorMode>("change-editor-mode");

export const updateHtmlAndOutline = actionCreator<{
  html: string;
  outline: Array<any>;
}>("update-html-and-outline");

export const updateRaw = actionCreator<string>("update-raw");

export const updateShowPreview = actionCreator<boolean>("update-show-preview");

export const updateShareState = actionCreator<ShareState>("update-share-state");

export const reducer = reducerWithoutInitialState<AppState>()
  .case(updateRaw, (state, raw) => {
    return {
      ...state,
      raw,
      wordCount: Array.from(raw).length
    };
  })
  .case(updateShowPreview, (state, showPreview) => {
    return { ...state, showPreview };
  })
  .case(changeToolMode, (state, toolMode) => {
    return { ...state, toolMode };
  })
  .case(changeEditorMode, (state, editorMode) => {
    return { ...state, editorMode };
  })
  .case(updateShareState, (state, share) => {
    return { ...state, share };
  })
  .case(updateHtmlAndOutline, (state, payload) => {
    return { ...state, ...payload };
  });
