import React from "react";

export const Help = React.memo(() => {
  return (
    <div className="help-block">
      <dl className="help-item">
        <dt className="help-item__dt">Cmd-S | Windows-S</dt>
        <dd className="help-item__dd">Run prettier</dd>

        <dt className="help-item__dt">Ctrl-1</dt>
        <dd className="help-item__dd">Toggle Preview</dd>

        <dt className="help-item__dt">Ctrl-Shift-E</dt>
        <dd className="help-item__dd">Switch editor-mode</dd>
      </dl>
    </div>
  );
});
