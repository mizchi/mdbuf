import React from "react";
import { useWriter } from "../../contexts/WriterContext";
import { useSelector } from "react-redux";
import { AppState } from "../../../types";
import { format } from "date-fns";

type Props = {
  wordCount: number;
  onClick: (e: any) => void;
};

export const BottomHelper = React.memo(function BottomHelper(props: Props) {
  const writer = useWriter();
  const size = useSelector((s: AppState) => s.raw.length);
  return (
    <div
      style={{
        position: "absolute",
        right: "20px",
        bottom: "20px",
        padding: 3,
        paddingRight: 7,
        borderRadius: 2,
        background: "#333",
        color: "#fff"
      }}
    >
      &nbsp;
      <button style={{ borderRadius: 3 }} onClick={props.onClick}>
        👀
      </button>
      &nbsp;
      <span>wc:{size}</span>
      {writer.handler && (
        <>
          &nbsp;
          <span>{writer.handler.name}</span>
          <span>{format(writer.timestamp, "HH:mm:ss")}</span>
        </>
      )}
    </div>
  );
});
