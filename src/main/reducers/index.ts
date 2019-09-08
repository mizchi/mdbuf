import actionCreatorFactory from "typescript-fsa";
import { reducerWithoutInitialState } from "typescript-fsa-reducers";
import { asyncFactory } from "typescript-fsa-redux-thunk";
import { AppState, EditorMode, ToolMode, WorkerAPI } from "../../types";

const actionCreator = actionCreatorFactory();
const asyncCreator = asyncFactory(actionCreator);

export const changeToolMode = actionCreator<ToolMode>("change-tool-mode");

export const changeEditorMode = actionCreator<EditorMode>("change-editor-mode");

export const updateShowPreview = actionCreator<boolean>("update-show-preview");

export const sync = actionCreator<Partial<AppState>>("sync");

const nextIdleFrame =
  // @ts-ignore
  window.requestIdleCallback ||
  window.requestAnimationFrame ||
  window.setTimeout;

export const updateRaw = asyncCreator<
  { raw: string; line?: number; remote: WorkerAPI },
  { html: string; outline: any }
>("updateRawWithPreview", async ({ raw, line, remote: api }) => {
  nextIdleFrame(() => {
    const wordCount = Array.from(raw).length;
    document.title = `mdbuf(${wordCount})`;
  });

  return await api.compile({ raw, line });
});

export const reducer = reducerWithoutInitialState<AppState>()
  .case(updateRaw.async.started, (state, { raw }) => {
    return {
      ...state,
      raw,
      wordCount: Array.from(raw).length
    };
  })
  .case(updateRaw.async.done, (state, { result }) => {
    return {
      ...state,
      ...result
    };
  })
  .case(sync, (state, other) => {
    return {
      ...state,
      ...other
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
  });
