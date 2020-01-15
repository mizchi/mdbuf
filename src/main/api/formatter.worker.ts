import prettier from "prettier/standalone";
import markdown from "prettier/parser-markdown";

export class MarkdownFormatter {
  async format(md: string): Promise<string> {
    return prettier.format(md, { parser: "markdown", plugins: [markdown] });
  }
}
