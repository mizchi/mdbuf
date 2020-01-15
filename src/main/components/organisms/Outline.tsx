import React, { useCallback, useEffect } from "react";
import { useCurrentBuffer } from "../../contexts/CurrentBufferContext";
import { useSelector } from "react-redux";
import { AppState } from "../../../shared/types";
import { sendGA } from "../../utils";

export const Outline = (props: { outline: Array<any> }) => {
  const size = useSelector((s: AppState) => Array.from(s.raw).length);
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
  useEffect(() => {
    sendGA("send", "event", "outline", "show");
  }, []);
  return (
    <>
      {props.outline.length === 0 && <span>(No heading block)</span>}
      {props.outline.map((heading, index) => {
        const title =
          heading.children && heading.children[0] && heading.children[0].value;
        const start = heading.start;
        const end = props.outline[index + 1]
          ? props.outline[index + 1].start - 1
          : size;
        return (
          <div key={index}>
            <button
              style={{
                borderRadius: 1,
                cursor: "pointer"
              }}
              onClick={() => onClickHeader(heading.start)}
            >
              {"#".repeat(heading.depth)}
              &nbsp;
              {title}: {start}~{end}
            </button>
          </div>
        );
      })}
    </>
  );
};
