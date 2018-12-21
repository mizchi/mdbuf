import React, { useLayoutEffect } from "react";

export const Preview = React.memo(function Preview(props: { html: string }) {
  const ref: React.RefObject<HTMLDivElement> = React.createRef();

  useLayoutEffect(() => {
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
      console.log("updated");
    });
  });

  return (
    <div
      ref={ref}
      className="markdown-body"
      style={{ padding: "10px", lineHeight: "1.3em" }}
      dangerouslySetInnerHTML={{ __html: props.html }}
    />
  );
});
