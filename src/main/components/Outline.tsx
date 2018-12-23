import React from "react";
export const Outline = (props: {
  outline: Array<any>;
  onSelectOutlineHeading: (offset: number) => void;
}) => {
  return (
    <>
      {props.outline.map((heading, index) => {
        return (
          <div
            style={{
              cursor: "pointer"
            }}
            key={index}
            onClick={() => {
              props.onSelectOutlineHeading(heading.start);
            }}
          >
            {"#".repeat(heading.depth)}
            &nbsp;
            {heading.children[0].value}: {heading.start}~
          </div>
        );
      })}
    </>
  );
};
