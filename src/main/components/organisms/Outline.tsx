import React, { useCallback } from "react";
import { useCurrentBuffer } from "../../contexts/CurrentBufferContext";

export const Outline = (props: { outline: Array<any> }) => {
  const buffer = useCurrentBuffer();
  const onClickHeader = useCallback(
    pos => {
      if (buffer) {
        buffer.setCursorPosition(pos);
        buffer.focus();
      }
    },
    [buffer]
  );
  return (
    <>
      {props.outline.length === 0 && <span>(No heading block)</span>}
      {props.outline.map((heading, index) => {
        const title =
          heading.children && heading.children[0] && heading.children[0].value;
        return (
          <div
            style={{
              cursor: "pointer"
            }}
            key={index}
            onClick={() => onClickHeader(heading.start)}
          >
            {"#".repeat(heading.depth)}
            &nbsp;
            {title}: {heading.start}~
          </div>
        );
      })}
    </>
  );
};
