# Minimum Markdown Tool

- yarn
- parcel with pwa-precache
- typescript

## How to dev

- `yarn dev`: Start asset server on `http://localhost:7777`
- `yarn build`: Generate SPA to `dist`

## How to render on your hands

```js
// css
import "github-markdown-css/github-markdown.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/default.css";

import remark from "remark";
import math from "remark-math";
import hljs from "remark-highlight.js";
import breaks from "remark-breaks";
import katex from "remark-html-katex";
import html from "remark-html";

const processor = remark()
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(html);

const html = processor.processSync("# Hello!).toString()
```

## LICENSE

MIT
