import React from "react";
import { SymbolLogoSvg } from "./SymbolLogoSvg";
import styled from "styled-components";

type Props = {
  wordCount: number;
  onClick: (e: any) => void;
};

export const BottomHelper = React.memo(function BottomHelper(props: Props) {
  return (
    <ButtomHelperContainer>
      <ButtomHelperText>
        {props.wordCount}
      </ButtomHelperText>
      <Button onClick={props.onClick}>
        <ButtonIcon>
          <SymbolLogoSvg />
        </ButtonIcon>
      </Button>
    </ButtomHelperContainer>
  );
});

const ButtomHelperContainer = styled.div`
  position: absolute;
  right: 1rem;
  bottom: 1rem;
`;

const ButtomHelperText = styled.span`
  padding-right: 0.3rem;
  color: #3f9dd4;
  font-family: "monospace";
  font-size: 0.85rem;
  font-weight: bold;
`;

const Button = styled.button`
  position: relative;
  background: #263842;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  border: 2px solid white;
  cursor: pointer;
  &:hover {
    top: -2px;
  }
  &:focus {
    outline: none;
  }
`;

const ButtonIcon = styled.span`
  display: inline-block;
  height: 32px;
`;