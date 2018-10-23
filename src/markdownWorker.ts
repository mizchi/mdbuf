import * as Comlink from "comlinkjs";
import processor from "./markdownProcessor";

// worker.js
class MarkdownCompiler {
  compile(raw: string) {
    const result = processor.processSync(raw).toString();
    return result;
  }

  getLastState(): { raw: string; html: string } {
    const raw = "# hello\n";
    return {
      raw,
      html: processor.processSync(raw).toString()
    };
  }
}

Comlink.expose(MarkdownCompiler, self);
