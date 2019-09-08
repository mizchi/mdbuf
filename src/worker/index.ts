import "regenerator-runtime/runtime";
import * as Comlink from "comlink";
import { api } from "../shared";
Comlink.expose(api);
