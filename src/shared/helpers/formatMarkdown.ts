let markdown: any = null;
let prettier: any = null;

// Start lazy load
// console.time("load:prettier");
(async () => {
  const [p0, p1] = await Promise.all([
    import(/* webpackChunkName: "prettier" */ "prettier/standalone"),
    import(/* webpackChunkName: "prettier" */ "prettier/parser-markdown")
  ]);
  prettier = p0.default || p0;
  markdown = p1.default || p1;
  // console.timeEnd("load:prettier");
})();

export default function formatMarkdown(md: string): string {
  if (prettier && markdown) {
    return prettier.format(md, { parser: "markdown", plugins: [markdown] });
  } else {
    return md;
  }
}
