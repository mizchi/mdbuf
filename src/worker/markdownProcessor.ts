import remark from "remark";
import math from "remark-math";
import hljs from "remark-highlight.js";
import breaks from "remark-breaks";
import katex from "remark-html-katex";
import html from "remark-html";
import toc from "remark-toc";
import frontmatter from "remark-frontmatter";

let __remark_cursor_line = 0; // initialize
function highlightCursorLine() {
  return (ast: {
    children: Array<{
      position: { start: { line: number } };
      data: {
        hProperties?: {
          className?: string;
        };
      };
    }>;
  }) => {
    const curLine = __remark_cursor_line;
    const starts = ast.children.map(node => node.position.start.line);

    // search most recent index
    for (let i = 0; i < starts.length; i++) {
      const current = starts[i];
      const next = starts[i + 1];
      if (current && next && current <= curLine && curLine < next) {
        const node = ast.children[i];
        node.data = {
          hProperties: {
            className: "cursor-focused"
          }
        };
        return;
      }
    }

    // highlight last item
    const node = ast.children[ast.children.length - 1];
    if (curLine !== 0 && node) {
      node.data = {
        hProperties: {
          className: "cursor-focused"
        }
      };
    }
  };
}

let outline: any = [];
function buildOutline() {
  return (ast: any) => {
    outline = ast.children
      .filter((node: any) => {
        return node.type === "heading";
      })
      .map((node: any) => {
        return {
          type: node.type,
          depth: node.depth,
          start: node.position.start.offset,
          end: node.position.end.offset,
          children: node.children
        };
      });
  };
}

const defaultProcessor = remark()
  .use(breaks)
  .use(highlightCursorLine)
  .use(math)
  .use(toc)
  .use(katex)
  .use(hljs)
  .use(html)
  .use(frontmatter, ["yaml"])
  .use(buildOutline);

let processor = defaultProcessor;

export const replaceProcessor = (newProcessor: any) => {
  processor = newProcessor;
};

export const compile = (raw: string, cursor?: number) => {
  __remark_cursor_line = cursor || 0;
  const html = processor.processSync(raw).toString();
  return {
    html,
    outline
  };
};
