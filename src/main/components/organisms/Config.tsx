import React from "react";
// @ts-ignore
const canUseFs = !!window.chooseFileSystemEntries;

// TODO
export const Config = React.memo(() => {
  return (
    <div style={{ padding: 10 }}>
      {canUseFs && <strong>Exprerimental: Use native file systems</strong>}
    </div>
  );
});
