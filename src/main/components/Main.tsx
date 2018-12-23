import React, { SyntheticEvent } from "react";
import styled from "styled-components";
import Loadable from "react-loadable";

import { Textarea } from "./TextareaEditor";
import { Preview } from "./Preview";
import { Outline } from "./Outline";
import { Help } from "./Help";
import { ToolMode, EditorMode } from "../../types";
import { editor } from "monaco-editor";

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
  padding: 10px;
`;

const Container = styled.div`
  flex: 1;
  height: 100vh;
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
  flex: 1;
  height: 100vh;
`;

const ToolTabsContainer = styled.div`
  height: 32px;
  color: white;
`;

const PreviewContainer = styled.div`
  height: calc(100vh - 32px);
  width: calc(100vw / 2);
  overflow-x: auto;
  overflow-y: auto;
  background: #eee;
`;

const TabButton = styled.div<{ selected: boolean }>`
  background-color: ${(p: any) => (p.selected ? "#eee" : "#272822")};
  color: ${(p: any) => (p.selected ? "#272822" : "#eee")};
  cursor: ${(p: any) => (p.selected ? "auto" : "pointer")};
  display: inline-flex;
  height: 100%;
  min-width: 80px;
  align-items: center;
  justify-content: center;
`;
