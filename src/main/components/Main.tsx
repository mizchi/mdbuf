import React, { SyntheticEvent, Suspense } from "react";
import styled from "styled-components";
import { TextareaEditor } from "./elements/TextareaEditor";
import { Preview } from "./organisms/Preview";
import { Outline } from "./organisms/Outline";
import { ToolMode, AppState } from "../types";
import { useSelector } from "react-redux";
import { useAction } from "./_hooks/commands";
import { updateRaw } from "../reducers";
import { CommandPalette } from "./organisms/CommandPallete";
import { BottomHelper } from "./elements/BottomHelper";
import { About } from "./organisms/About";

const Loading = () => (
  <div style={{ color: "#fff", paddingLeft: 20 }}>Loading...</div>
);

const MonacoEditor = React.lazy(() => import("./elements/MonacoEditor"));

export const Main = React.memo(function Main({
  editorRef,
  onChangeToolMode,
  onWheel,
  previewContainerRef,
}: {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  previewContainerRef: React.RefObject<HTMLDivElement>;
  onChangeToolMode: (value: ToolMode) => void;
  onWheel: (event: SyntheticEvent<HTMLTextAreaElement>) => void;
}) {
  const {
    ast,
    raw,
    editorMode,
    toolMode,
    showPreview,
    toc,
    initialized,
  } = useSelector((s: AppState) => ({
    initialized: s.initialized,
    ast: s.ast,
    raw: s.raw,
    toc: s.toc,
    toolMode: s.toolMode,
    editorMode: s.editorMode,
    showPreview: s.showPreview,
  }));

  const onChangeValue = useAction(
    (raw: string) => {
      if (editorRef.current) {
        const el = editorRef.current as HTMLTextAreaElement;
        const line = el.value.substr(0, el.selectionStart).split("\n").length;
        return updateRaw.action({ raw, line });
      } else {
        return updateRaw.action({ raw });
      }
    },
    [raw]
  );

  return (
    <>
      <BottomHelper />

      <Container>
        <Centered>
          <EditorContainer>
            {editorMode === "monaco" && (
              <Suspense fallback={<Loading />}>
                <MonacoEditor
                  value={raw}
                  width={showPreview ? "50vw" : "100vw"}
                  onChangeValue={onChangeValue}
                />
              </Suspense>
            )}
            {editorMode === "textarea" && (
              <TextareaEditor
                disabled={!initialized}
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
          <ToolSelector>
            {["preview", "outline", "command", "about"].map((mode, index) => {
              return (
                <TabButton
                  key={mode}
                  selected={mode === toolMode}
                  onClick={() => onChangeToolMode(mode as ToolMode)}
                >
                  {mode}[{index + 1}]
                </TabButton>
              );
            })}
          </ToolSelector>
          <ToolContainer ref={previewContainerRef}>
            {toolMode === "command" && <CommandPalette />}
            {toolMode === "about" && <About />}
            {toolMode === "preview" && <Preview ast={ast} />}
            {toolMode === "outline" && (
              <OutlineContainer>
                WIP
                {/* <Outline outline={outline} /> */}
              </OutlineContainer>
            )}
          </ToolContainer>
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
  overflow: none;
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
  /* padding-top: 8px; */
`;

const SideTools = styled.div`
  flex: 1;
  height: 100vh;
`;

const ToolSelector = styled.div`
  height: 32px;
  color: white;
`;

const ToolContainer = styled.div`
  height: calc(100vh - 32px);
  width: calc(100vw / 2);
  overflow-x: auto;
  overflow-y: auto;
  background: #eee;
`;

const TabButton = styled.div<{ selected: boolean }>`
  background-color: ${(p: any) => (p.selected ? "#eee" : "#2d2a2e")};
  color: ${(p: any) => (p.selected ? "#2d2a2e" : "#eee")};
  cursor: ${(p: any) => (p.selected ? "auto" : "pointer")};
  display: inline-flex;
  height: 100%;
  min-width: 80px;
  align-items: center;
  padding-right: 3px;
  padding-left: 2px;
  justify-content: center;
`;
