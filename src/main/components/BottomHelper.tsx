import React from "react";
import { SymbolLogoSvg } from "./SymbolLogoSvg"

type Props = {
  wordCount: number;
  onClick: (e: any) => void;
};

export const BottomHelper = React.memo(function BottomHelper(props: Props) {
  return (
    <div style={{ position: "absolute", right: "20px", bottom: "20px" }}>
      <span className="helper-text">
        {props.wordCount}
      </span>
      &nbsp;
      <button onClick={props.onClick} className="button">
        <SymbolLogoSvg />
      </button>
    </div>
  );
});
