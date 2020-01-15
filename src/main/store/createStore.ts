import { reducer } from "../reducers/index";
import { debounce } from "lodash-es";
import {
  createStore as _createStore,
  applyMiddleware,
  AnyAction,
  Middleware
} from "redux";
import thunkMiddleware, { ThunkMiddleware } from "redux-thunk";
import { AppState } from "../types";
import { initialState, initialText } from "./data";

export function createStore() {
  const store = _createStore(
    reducer,
    initialState,
    applyMiddleware(
      thunkMiddleware as ThunkMiddleware<AppState, AnyAction>,
      saveMiddleware
    )
  );
  return store;
}

// @ts-ignore
import { StorageArea } from "kv-storage-polyfill";

const storage = new StorageArea("state");
const key = "$current";

const save = debounce(async state => {
  console.log("[save]", state);
  await storage.set(key, state);
  // _api.saveCurrentState(state);
  document.title = "mdbuf(" + Array.from(state.raw).length + ")";
}, 500);

const saveMiddleware: Middleware<AppState> = store => next => action => {
  const state = store.getState();
  save(state);
  next(action);
};

export async function getLastState(): Promise<AppState> {
  const currentSave = await storage.get(key);
  if (currentSave) {
    return { ...currentSave, initialized: true };
  }
  const initial: AppState = {
    ...initialState,
    initialized: true,
    raw: initialText,
    wordCount: Array.from(initialText).length,
    outline: []
  };
  return initial;
}
