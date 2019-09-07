import React from "react";

export const Help = React.memo(() => {
  return (
    <div style={{ padding: 10 }}>
      <dl>
        <dt>Meta + O</dt>
        <dd>(Exprimental) Open file</dd>

        <dt>Meta + S</dt>
        <dd>(Exprimental) Save file</dd>

        <dt>Ctrl-1</dt>
        <dd>Toggle Preview</dd>

        <dt>Ctrl-Shift-E</dt>
        <dd>Switch editor-mode</dd>

        <dt>Ctrl-Shfit-F</dt>
        <dd>Run prettier</dd>
      </dl>
    </div>
  );
});
