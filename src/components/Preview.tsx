import React, { useLayoutEffect } from "react";
import morphdom from "morphdom";

export const Preview = React.memo(function Preview(props: { html: string }) {
  const ref: React.RefObject<HTMLDivElement> = React.createRef();

  useLayoutEffect(() => {
    if (ref.current) {
      if (ref.current.childNodes.length === 0) {
        ref.current.innerHTML = props.html;
      } else {
        requestAnimationFrame(() => {
          morphdom(
            ref.current as HTMLElement,
            `<div class="markdown-body">${props.html}</div>`
          );
        });
      }
    }

    requestAnimationFrame(() => {
      if (ref.current) {
        const focused = ref.current.querySelector(".cursor-focused");
        if (focused) {
          focused.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }
      }
    });
  });

  return <div className="markdown-body" ref={ref} />;
});
