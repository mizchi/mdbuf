// codemirror theme
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

// highlight language
import "codemirror/mode/gfm/gfm";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/mllike/mllike";
import "codemirror/mode/dart/dart";
import "codemirror/mode/rust/rust";
import "codemirror/mode/dockerfile/dockerfile";
import "codemirror/mode/elm/elm";
import "codemirror/mode/php/php";
import "codemirror/mode/swift/swift";
import "codemirror/mode/sql/sql";
import "codemirror/mode/vue/vue";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/htmlembedded/htmlembedded";
import "codemirror/mode/python/python";
import "codemirror/mode/ruby/ruby";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/css/css";

import React, { useState, useEffect } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

type Props = {
  value: string;
  onChangeValue: (value: string) => void;
};

export default (props: Props) => {
  // react to outer change by prettier
  const [initialValue, setInitialValue] = useState(props.value);
  const [localValue, setValue] = useState(props.value);

  useEffect(() => {
    if (initialValue !== props.value) {
      setInitialValue(props.value);
      setValue(props.value);
    }
  });

  return (
    <CodeMirror
      value={localValue}
      onBeforeChange={(_0, _1, value) => {
        setValue(value);
      }}
      options={
        {
          mode: "gfm",
          theme: "material",
          inputStyle: "textarea",
          indentSize: 2,
          indentWithTabs: false,
          lineWrapping: true
        } as any
      }
      editorDidMount={editor => {
        // Patch for Google IME
        editor.getInputField().style.marginBottom = "-2em";
        editor.refresh();
        editor.setCursor({ line: 0, ch: 0 });
        editor.focus();
      }}
      onChange={(editor, data, currentValue) => {
        // setValue(currentValue);
        props.onChangeValue(currentValue);
      }}
    />
  );
};
