import * as Comlink from "comlinkjs";

export default Comlink.proxy(
  new Worker("../worker/index.ts", { type: "module" })
);
