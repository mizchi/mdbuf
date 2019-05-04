import React, { SyntheticEvent } from "react";
import styled from "styled-components";
import Loadable from "react-loadable";

import { Textarea } from "./TextareaEditor";
import { Preview } from "./Preview";
import { Outline } from "./Outline";
import { Help } from "./Help";
import { ToolMode, EditorMode } from "../../types";
import { editor } from "monaco-editor";
import { LogoSvg } from "./LogoSvg"

const Loading = () => (
  <div style={{ color: "#fff", paddingLeft: 20 }}>Loading...</div>
);

const CodeMirrorEditor = Loadable({
  loader: () => import("./CodeMirrorEditor"),
  loading: () => <Loading />
});

const MonacoEditor = Loadable({
  loader: () => import("./MonacoEditor"),
  loading: () => <Loading />
});

export const Main = React.memo(function Main({
  editorRef,
  html,
  raw,
  editorMode,
  toolMode,
  outline,
  onChangeToolMode,
  onChangeValue,
  onSelectOutlineHeading,
  onWheel,
  previewContainerRef,
  showPreview
}: {
  html: string;
  raw: string;
  editorMode: EditorMode;
  toolMode: ToolMode;
  showPreview: boolean;
  outline: Array<any>;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  previewContainerRef: React.RefObject<HTMLDivElement>;
  onChangeToolMode: (value: ToolMode) => void;
  onChangeValue: (value: string) => void;
  onSelectOutlineHeading: (offset: number) => void;
  onWheel: (event: SyntheticEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <>
      <Container>
        <HeaderTitle>
          <HeaderLink>
            <LogoArea>
              <LogoSvg />
            </LogoArea>
          </HeaderLink>
        </HeaderTitle>
        <Centered>
          <EditorContainer>
            {editorMode === "monaco" && (
              <MonacoEditor
                value={raw}
                width={showPreview ? "50vw" : "100vw"}
                onChangeValue={onChangeValue}
              />
            )}
            {editorMode === "codemirror" && (
              <CodeMirrorEditor value={raw} onChangeValue={onChangeValue} />
            )}
            {editorMode === "textarea" && (
              <Textarea
                ref={editorRef}
                raw={raw}
                onChangeValue={onChangeValue}
                onWheel={onWheel}
              />
            )}
          </EditorContainer>
        </Centered>
      </Container>
      {showPreview && (
        <SideTools>
          <ToolTabsContainer>
            {["preview", "outline", "help"].map(mode => {
              return (
                <TabButton
                  key={mode}
                  selected={mode === toolMode}
                  onClick={() => onChangeToolMode(mode as any)}
                >
                  {mode}
                </TabButton>
              );
            })}
          </ToolTabsContainer>
          <PreviewContainer ref={previewContainerRef}>
            {toolMode === "preview" && <Preview html={html} />}
            {toolMode === "outline" && (
              <OutlineContainer>
                <Outline
                  outline={outline}
                  onSelectOutlineHeading={onSelectOutlineHeading}
                />
              </OutlineContainer>
            )}
            {toolMode === "help" && <Help />}
          </PreviewContainer>
        </SideTools>
      )}
    </>
  );
});

const OutlineContainer = styled.div`
  line-height: 2rem;
`;

const Container = styled.div`
  flex: 1;
  height: 100vh;
`;

const HeaderTitle = styled.h1`
  height: 40px;
  margin: 0 1.5rem;
`;

const HeaderLink = styled.a`
  display: inline-block;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const LogoArea = styled.div`
  height: 30px;
  line-height: 0;
`;


const Centered = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const EditorContainer = styled.div`
  width: 100%;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 8px;
`;

const SideTools = styled.div`
  flex: 1 1 0%;
  height: 100vh;
`;

const ToolTabsContainer = styled.div`
  display: flex;
  height: 2.4rem
  padding-left: 0.5rem;
  color: white;
  letter-spacing: 0.02rem;
  background: #273842;
  font-size: 0.8rem;
`;

const PreviewContainer = styled.div`
  display: flex;
  height: calc(100vh - 2.5rem);
  width: calc(100vw / 2);
  padding: 2rem;
  color: #263842;
  overflow-x: auto;
  overflow-y: auto;
  background: white;
  border-radius: 3px;
`;

const TabButton = styled.div<{ selected: boolean }>`
  display: flex;
  border-top: ${(p: any) => (p.selected ? "4px solid #3f9dd4" : "none")};
  background: ${(p: any) => (p.selected ? "rgba(255,255,255,.8)" : "none")};
  color: ${(p: any) => (p.selected ? "#273842" : "rgba(255,255,255,.5)")};
  cursor: ${(p: any) => (p.selected ? "auto" : "pointer")};
  margin-top: 2px;
  padding: 0 1.2rem;
  min-width: 80px;
  font-family: 'Roboto Mono', monospace;
  font-weight: bold;
  border-radius: 2px 2px 0 0;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${(p: any) => (p.selected ? "#273842" : "white")};
  }
`;
