import React from "react";
import styled from "styled-components";
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
          <OutlineItem
            key={index}
            onClick={() => {
              props.onSelectOutlineHeading(heading.start);
            }}
          >
            {"#".repeat(heading.depth)}
            &nbsp;
            {title}: {heading.start}~
          </OutlineItem>
        );
      })}
    </>
  );
};

const OutlineItem = styled.div`
  background: whitesmoke;
  margin-bottom: 0.5rem;
  padding: 0.25rem 1rem;
  font-size: 0.875rem;
  font-weight: bold;
  font-family: 'Roboto Mono',monospace;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background: #cccccc;
  }
`;