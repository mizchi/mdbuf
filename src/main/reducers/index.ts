import { WorkerAPI } from "./../../types";
import actionCreatorFactory from "typescript-fsa";
import { reducerWithoutInitialState } from "typescript-fsa-reducers";
import { asyncFactory } from "typescript-fsa-redux-thunk";
import { AppState, ToolMode, EditorMode } from "../../types";

const actionCreator = actionCreatorFactory();
const asyncCreator = asyncFactory(actionCreator);

export const changeToolMode = actionCreator<ToolMode>("change-tool-mode");

export const changeEditorMode = actionCreator<EditorMode>("change-editor-mode");

export const updateShowPreview = actionCreator<boolean>("update-show-preview");

const nextIdleFrame =
  // @ts-ignore
  window.requestIdleCallback ||
  window.requestAnimationFrame ||
  window.setTimeout;

export const updateRaw = asyncCreator<
  { raw: string; line?: number; api: WorkerAPI },
  { html: string; outline: any }
>("updateRawWithPreview", async ({ raw, line, api }) => {
  nextIdleFrame(() => {
    const wordCount = Array.from(raw).length;
    document.title = `mdbuf(${wordCount})`;
  });

  return await api.compile({ raw, line });
});

export const formatRaw = asyncCreator<
  { raw: string; api: WorkerAPI; ref: React.RefObject<HTMLTextAreaElement> },
  { html: string; outline: any }
>("formatRaw", async ({ raw, api, ref }) => {
  nextIdleFrame(() => {
    const wordCount = Array.from(raw).length;
    document.title = `mdbuf(${wordCount})`;
  });

  const formatted = await api.format(raw);

  // focus after set
  if (ref.current != null) {
    const start = ref.current.selectionStart;
    ref.current.value = formatted;
    ref.current.selectionStart = start;
    ref.current.selectionEnd = start;
  }

  return await api.compile({ raw: formatted });
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

  .case(formatRaw.async.started, (state, { raw }) => {
    return {
      ...state,
      raw,
      wordCount: Array.from(raw).length
    };
  })
  .case(formatRaw.async.done, (state, { result }) => {
    return {
      ...state,
      ...result
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
