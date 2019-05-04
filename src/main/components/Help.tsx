import React from "react";
import styled from "styled-components";

export const Help = React.memo(() => {
  return (
    <HelpContainer>
      <HelpItem>Cmd-S | Windows-S</HelpItem>
      <HelpText>Run prettier</HelpText>

      <HelpItem>Ctrl-1</HelpItem>
      <HelpText>Toggle Preview</HelpText>

      <HelpItem>Ctrl-Shift-E</HelpItem>
      <HelpText>Switch editor-mode</HelpText>
    </HelpContainer>
  );
});

const HelpContainer = styled.dl`
  margin-top: 0;
  margin-bottom: 0;
  font-family: 'Roboto Mono',monospace;
`;

const HelpItem = styled.dt`
  border: 1px solid #e8e8e8;
  padding: 0.2rem 0.4rem;
  display: inline-block;
  border-radius: 3px;
  font-size: 0.75rem;
  letter-spacing: 1px;
`;

const HelpText = styled.dd`
  font-size: 0.875rem;
  margin: 0.25rem 1rem 1rem;
`