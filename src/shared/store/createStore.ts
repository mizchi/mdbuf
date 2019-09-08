import { reducer } from "../reducers/index";
import {
  createStore as _createStore,
  applyMiddleware,
  AnyAction,
  Middleware
} from "redux";
import thunkMiddleware, { ThunkMiddleware } from "redux-thunk";
import { AppState, WorkerAPI } from "../types";
import { debounce } from "lodash-es";

let _api: WorkerAPI = null as any;
export async function createStore(api: WorkerAPI) {
  _api = api;
  const initialState = await loadState(api);
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

const save = debounce(state => {
  _api.saveCurrentState(state);
  document.title = "mdbuf(" + Array.from(state.raw).length + ")";
}, 500);

const saveMiddleware: Middleware<AppState> = store => next => action => {
  const state = store.getState();
  save(state);
  next(action);
};

async function loadState(proxy: WorkerAPI): Promise<AppState> {
  return proxy.getLastState();
}
