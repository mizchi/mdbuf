import processor from "../markdownProcessor";

const raw = `0
# aaa

ccc

ddd
eee`;

const ret = processor
  .processSync(raw, { cursor: { line: 1, column: 1 } })
  .toString();

console.log(ret);
