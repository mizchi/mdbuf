import React, {
  SyntheticEvent,
  forwardRef,
  useCallback,
  useLayoutEffect
} from "react";
import styled from "styled-components";

const TAB_STR = "  ";

type Props = {
  raw: string;
  onChangeValue: (value: string) => void;
  onWheel: (event: SyntheticEvent<HTMLTextAreaElement>) => void;
};

export const Textarea = forwardRef((props: Props, ref: any) => {
  let isComposing = false;

  const onCompositionStart = useCallback(() => {
    isComposing = true;
  }, []);

  const onCompositionEnd = useCallback((ev: any) => {
    isComposing = false;
    props.onChangeValue(ev.target.value);
  }, []);

  const onChange = useCallback((ev: any) => {
    if (isComposing) {
      return true;
    }
    props.onChangeValue(ev.target.value);
  }, []);

  const onKeydown = useCallback((e: KeyboardEvent) => {
    // Tab Indent
    if (e.keyCode === 9 && !isComposing) {
      e.preventDefault();
      const el: HTMLTextAreaElement = e.target as any;
      let start: number = el.selectionStart;
      let end: number = el.selectionEnd;
      const raw = el.value;
      const lineStart = raw.substr(0, start).split("\n").length - 1;
      const lineEnd = raw.substr(0, end).split("\n").length - 1;
      const lines = raw.split("\n");
      lines.forEach((line, i) => {
        if (i < lineStart || i > lineEnd || lines[i] === "") {
          return;
        }
        if (!e.shiftKey) {
          // Insert tab at head
          lines[i] = TAB_STR + line;
          start += i == lineStart ? TAB_STR.length : 0;
          end += TAB_STR.length;
        } else if (lines[i].substr(0, TAB_STR.length) === TAB_STR) {
          // Delete tab at head
          lines[i] = lines[i].substr(TAB_STR.length);
          start -= i == lineStart ? TAB_STR.length : 0;
          end -= TAB_STR.length;
        }
      });
      const newRaw = lines.join("\n");
      el.value = newRaw;
      el.setSelectionRange(start, end);
      props.onChangeValue((e as any).target.value);
    }
  }, []);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.selectionStart = 0;
      ref.current.selectionEnd = 0;
      ref.current.focus();
    }
  }, []);

  return (
    <StyledTextarea
      ref={ref}
      spellCheck={false}
      defaultValue={props.raw}
      onChange={onChange}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onKeyDown={onKeydown as any}
      onWheel={props.onWheel}
    />
  );
});

const StyledTextarea = styled.textarea`
  width: 100%;
  height: calc(100vh - 10px);
  padding-top: 3rem;
  padding-bottom: 3rem;
  padding-left: 1.5rem;
  box-sizing: border-box;
  outline: none;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9em;
  color: white;
  background: #273842;
  resize: none;
  border: none;
  line-height: 1.2;
`;
