import * as Comlink from "comlink";
// @ts-ignore
import Worker from "./format.w";

const worker = new Worker();
const api = Comlink.wrap(worker as Worker);

// @ts-ignore
global.MdbufFormatter = api;
