import React, { useLayoutEffect } from "react";
import morphdom from "morphdom";
import { createGlobalStyle } from "styled-components";

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


const GlobalStyle = createGlobalStyle`
  .markdown-body { 
    line-height: 1.3em;
    flex: 1;
  }
  .markdown-body h1,h2,h3 {
    color: #263842;
  }

  .markdown-body .highlight pre, .markdown-body pre {
    background-color: #e2e2e2;
  }

  .cursor-focused {
    background-color: rgba(255, 128, 128, 0.2);
  }
`;