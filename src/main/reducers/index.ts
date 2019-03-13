import actionCreatorFactory from "typescript-fsa";
import { reducerWithoutInitialState } from "typescript-fsa-reducers";
import { AppState, ToolMode, EditorMode } from "../../types";

const actionCreator = actionCreatorFactory();

export const changeToolMode = actionCreator<ToolMode>("change-tool-mode");

export const changeEditorMode = actionCreator<EditorMode>("change-editor-mode");

export const updateHtmlAndOutline = actionCreator<{
  html: string;
  outline: Array<any>;
}>("update-html-and-outline");

export const updateRaw = actionCreator<string>("update-raw");

export const updateShowPreview = actionCreator<boolean>("update-show-preview");

export const reducer = reducerWithoutInitialState<AppState>()
  .case(updateRaw, (state, raw) => {
    return {
      ...state,
      raw,
      wordCount: Array.from(raw).length
    };
  })
  .case(updateShowPreview as any, (state: AppState, showPreview: any) => {
    return { ...state, showPreview };
  })
  .case(changeToolMode as any, (state: AppState, toolMode: any) => {
    return { ...state, toolMode };
  })
  .case(changeEditorMode as any, (state: AppState, editorMode: any) => {
    return { ...state, editorMode };
  })
  .case(updateHtmlAndOutline, (state: AppState, payload: any) => {
    return { ...state, ...payload };
  });
