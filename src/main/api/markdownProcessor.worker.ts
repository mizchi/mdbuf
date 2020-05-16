import { parse } from "amdx";

export class MarkdownCompiler {
  compile(
    raw: string,
    line?: number
  ): { ast: any; toc: Array<any>; frontmatter: any } {
    const { ast, toc, frontmatter } = parse(raw, {
      cursor: {
        line: line ?? 0,
      },
    });
    return {
      frontmatter,
      ast,
      toc,
    };
  }
}
