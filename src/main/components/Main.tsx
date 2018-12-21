import React, { SyntheticEvent } from "react";
import { Textarea } from "./Textarea";
import { Preview } from "./Preview";

export const Main = React.memo(function Main({
  editorRef,
  html,
  raw,
  onChangeValue,
  onWheel,
  previewContainerRef,
  showPreview
}: {
  html: string;
  raw: string;
  showPreview: boolean;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  previewContainerRef: React.RefObject<HTMLDivElement>;
  onChangeValue: (value: string) => void;
  onWheel: (event: SyntheticEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <>
      <div style={{ flex: 1, height: "100vh" }}>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "960px",
              marginLeft: "auto",
              marginRight: "auto",
              paddingTop: "8px"
            }}
          >
            <Textarea
              ref={editorRef}
              raw={raw}
              onChangeValue={onChangeValue}
              onWheel={onWheel}
            />
          </div>
        </div>
      </div>
      {showPreview && (
        <div
          ref={previewContainerRef}
          style={{
            flex: 1,
            height: "100vh",
            overflowY: "auto",
            background: "#eee"
          }}
        >
          <div style={{ overflowY: "auto" }}>
            <Preview html={html} />
          </div>
        </div>
      )}
    </>
  );
});
