import remark from "remark";
import math from "remark-math";
import hljs from "remark-highlight.js";
import breaks from "remark-breaks";
import katex from "remark-html-katex";
import html from "remark-html";

export default remark()
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(html);
