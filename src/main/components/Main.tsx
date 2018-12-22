import React, { SyntheticEvent } from "react";
import { Textarea } from "./Textarea";
import { Preview } from "./Preview";
import styled from "styled-components";

export const Main = React.memo(function Main({
  editorRef,
  html,
  raw,
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
  toolMode: "preview" | "outline" | "help";
  showPreview: boolean;
  outline: Array<any>;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  previewContainerRef: React.RefObject<HTMLDivElement>;
  onChangeToolMode: (value: "preview" | "outline") => void;
  onChangeValue: (value: string) => void;
  onSelectOutlineHeading: (offset: number) => void;
  onWheel: (event: SyntheticEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <>
      <Container>
        <Centered>
          <EditorContainer>
            <Textarea
              ref={editorRef}
              raw={raw}
              onChangeValue={onChangeValue}
              onWheel={onWheel}
            />
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

const Outline = (props: {
  outline: Array<any>;
  onSelectOutlineHeading: (offset: number) => void;
}) => {
  return (
    <>
      {props.outline.map((heading, index) => {
        console.log(heading);
        return (
          <div
            style={{
              cursor: "pointer"
            }}
            key={index}
            onClick={() => {
              props.onSelectOutlineHeading(heading.start);
              // console.log(heading.start, heading.end);
            }}
          >
            {/* {heading.start} */}
            {"#".repeat(heading.depth)}
            &nbsp;
            {heading.children[0].value}: {heading.start}~
          </div>
        );
      })}
    </>
  );
};

const Help = () => {
  return (
    <div style={{ padding: 10 }}>
      <dl>
        <dt>Cmd-S | Windows-S</dt>
        <dd>Run prettier</dd>
        <dt>Ctrl-1</dt>
        <dd>Toggle Preview</dd>
      </dl>
    </div>
  );
};

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
  width: 50vw;
  overflow-x: auto;
  overflow-y: auto;
  background: #eee;
  /* word-break: break-all; */
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
