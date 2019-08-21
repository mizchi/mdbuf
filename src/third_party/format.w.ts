import * as comlink from "comlink";

import formatMarkdown from "../worker/formatMarkdown";

comlink.expose({
  async formatMarkdown(raw: string): Promise<string> {
    const formatted = await formatMarkdown(raw);
    return formatted;
  }
});
