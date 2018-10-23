import remark from "remark";
import math from "remark-math";
import katex from "remark-html-katex";
import html from "remark-html";

export default remark()
  .use(math)
  .use(katex)
  .use(html);
