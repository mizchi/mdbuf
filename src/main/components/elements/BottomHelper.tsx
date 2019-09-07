import React from "react";

type Props = {
  wordCount: number;
  onClick: (e: any) => void;
};

export const BottomHelper = React.memo(function BottomHelper(props: Props) {
  return (
    <div style={{ position: "absolute", right: "20px", bottom: "20px" }}>
      &nbsp;
      <button onClick={props.onClick}>👀</button>
    </div>
  );
});
