import remark from "remark";
import math from "remark-math";
import hljs from "remark-highlight.js";
import breaks from "remark-breaks";
import katex from "remark-html-katex";
import html from "remark-html";
import toc from "remark-toc";

(global as any).__remark_cursor_line = 0; // initialize
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
    const curLine = (global as any).__remark_cursor_line;
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
        break;
      }
    }

    // highlight last item
    const node = ast.children[ast.children.length - 1];
    node.data = {
      hProperties: {
        className: "cursor-focused"
      }
    };
  };
}

export default remark()
  .use(breaks)
  .use(highlightCursorLine)
  .use(math)
  .use(toc)
  .use(katex)
  .use(hljs)
  .use(html);
