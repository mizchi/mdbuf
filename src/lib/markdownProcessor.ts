import remark from "remark";
import math from "remark-math";
import hljs from "remark-highlight.js";
import breaks from "remark-breaks";
import katex from "remark-html-katex";
import html from "remark-html";
import toc from "remark-toc";

(global as any).__remark_line_no = 0; // initialize
function myMod() {
  return (node: any) => {
    node.children.forEach((n: any) => {
      if (n.position.start.line === (global as any).__remark_line_no) {
        n.data = {};
        n.data.hProperties = {
          className: "cursor-focused"
        };
      }
    });
  };
}

export default remark()
  .use(myMod, { a: 1 })
  .use(breaks)
  .use(math)
  .use(toc)
  .use(katex)
  .use(hljs)
  .use(html);
