import * as Comlink from "comlinkjs";
import processor from "./markdownProcessor";

// worker.js
class MarkdownCompiler {
  compile(raw: string) {
    const result = processor.processSync(raw).toString();
    return result;
  }
}

Comlink.expose(MarkdownCompiler, self);
