サンプルテキストは https://qiita.com/mizchi/items/4d25bc26def1719d52e6.md

markdown のコンパイルと、 innerHTML への挿入の時間の計測

# 素朴な実装

```js
import processor from "./markdownProcessor";

const textarea = document.querySelector(".js-editor");
const preview = document.querySelector(".js-preview");

if (textarea && preview) {
  textarea.addEventListener("input", (ev: any) => {
    const raw: string = ev.target.value;
    console.time("compile");
    const result = processor.processSync(raw).toString();
    console.timeEnd("compile");

    requestAnimationFrame(() => {
      console.time("innerHTML");
      preview.innerHTML = result;
      console.timeEnd("innerHTML");
    });
  });
}
```

- compile: 28~32ms
- innerHTML: 0.8~1.2ms
