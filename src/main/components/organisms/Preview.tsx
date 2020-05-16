import React, { useLayoutEffect, useRef } from "react";
import { compile } from "amdx-runner";

export const Preview = React.memo(function Preview(props: { ast: any | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      const hit = ref.current.querySelector(".cursor-focused");
      if (hit) {
        hit.scrollIntoView();
      }
    }
  }, [props.ast]);

  const el = props.ast ? (
    compile(props.ast, {
      components: {},
      h: React.createElement,
      Fragment: React.Fragment,
      props: {},
    })
  ) : (
    <></>
  );
  return (
    <div
      style={{ width: "100%", height: "calc(100vh - 32px)", overflow: "auto" }}
    >
      <div ref={ref} className="markdown-body" style={{ padding: 0 }}>
        {el}
      </div>
    </div>
  );
});
