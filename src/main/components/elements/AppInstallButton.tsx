import React, { useEffect, useState, useCallback } from "react";

let _installPrompt: any;
window.addEventListener("beforeinstallprompt", (e: any) => {
  e.preventDefault();
  _installPrompt = e;
});

export function AppInstallButton() {
  const [prompt, setInstallPrompt] = useState<any>(_installPrompt);
  useEffect(() => {
    if (_installPrompt) return;
    const id = setInterval(() => {
      if (_installPrompt) {
        setInstallPrompt(_installPrompt);
        if (id) clearInterval(id);
      }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const onClickInstall = useCallback(() => {
    if (prompt) {
      prompt.prompt();
    }
  }, [prompt]);

  return prompt ? (
    <button disabled={!prompt} onClick={onClickInstall}>
      App Install
    </button>
  ) : (
    <></>
  );
}
