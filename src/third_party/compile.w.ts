import { compile } from "../worker/markdownProcessor";
import * as comlink from "comlink";

comlink.expose({
  async compile(raw: string): Promise<string> {
    const { html } = await compile(raw);
    return html;
  }
});
