import React from "react";

export const Outline = (props: {
  outline: Array<any>;
  onSelectOutlineHeading: (offset: number) => void;
}) => {
  return (
    <>
      {props.outline.map((heading, index) => {
        const title =
          heading.children && heading.children[0] && heading.children[0].value;

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
            {title}: {heading.start}~
          </div>
        );
      })}
    </>
  );
};
