import React, { useRef, useLayoutEffect } from "react";

/*
How to use

  <ResizeDetector
    style={{
      width: "50vw",
      height: "100vh",
      overflow: "none"
    }}
    onResize={rect => {
      // resize monaco-editor
      editor &&
        editor.layout({
          width: rect.width as any,
          height: rect.height as any
        });
    }}
  >
    <MonacoEditor
      {...{
        editor,
        value: 'hello',
        editorDidMount: editorDidMount
      }}
    />
  </ResizeDetector>
*/

type Rect = {
  x: string;
  y: string;
  width: string;
  height: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
};

export function ResizeDetector(props: {
  children: any;
  onResize: (rect: Rect) => void;
  style?: React.CSSProperties;
}) {
  const containerRef: React.RefObject<HTMLDivElement> = useRef(null as any);
  useLayoutEffect(
    () => {
      if (containerRef.current) {
        const observer = new ResizeObserver(
          (
            entries: Array<{
              target: HTMLElement;
              contentRect: Rect;
            }>
          ) => {
            entries.forEach(({ contentRect }) => {
              props.onResize(contentRect);
            });
          }
        );
        observer.observe(containerRef.current);
        return () => {
          observer.unobserve(containerRef.current);
          observer.disconnect();
        };
      }
    },
    [props.children]
  );
  return (
    <div style={props.style} ref={containerRef}>
      {props.children}
    </div>
  );
}
