import * as Comlink from "comlink";
// @ts-ignore
import Worker from "./compile.w";

const worker = new Worker();
const api = Comlink.wrap(worker) as any;
// @ts-ignore
const instance = global.MdbufCompiler;
if (instance) {
  if (instance instanceof Function) {
    const resolver = instance;
    // @ts-ignore
    global.MdbufCompiler = api;
    resolver();
  }
} else {
  // @ts-ignore
  global.MdbufCompiler = api;
}
