import { reducer } from "../reducers/index";
import {
  createStore as _createStore,
  applyMiddleware,
  AnyAction,
  Middleware
} from "redux";
import thunkMiddleware, { ThunkMiddleware } from "redux-thunk";
import { AppState, WorkerAPI } from "../types";

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

// helpers
async function saveState(proxy: WorkerAPI, state: AppState): Promise<void> {
  proxy.saveCurrentState(state);
}

async function loadState(proxy: WorkerAPI): Promise<AppState> {
  return proxy.getLastState();
}

const saveMiddleware: Middleware<AppState> = store => next => action => {
  // saveState(remote, newState);
  const state = store.getState();
  saveState(_api, state);
  next(action);
};
