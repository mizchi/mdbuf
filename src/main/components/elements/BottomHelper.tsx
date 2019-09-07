import React from "react";
import { useWriter } from "../../contexts/WriterContext";

type Props = {
  wordCount: number;
  onClick: (e: any) => void;
};

export const BottomHelper = React.memo(function BottomHelper(props: Props) {
  const writer = useWriter();
  return (
    <div
      style={{
        position: "absolute",
        right: "20px",
        bottom: "20px",
        padding: 3,
        borderRadius: 4,
        background: "wheat"
      }}
    >
      &nbsp;
      <button onClick={props.onClick}>👀</button>
      &nbsp;
      {writer.handler && <span>{writer.handler.name}</span>}
      &nbsp;
      {writer.handler && <span>{writer.timestamp}</span>}
    </div>
  );
});
