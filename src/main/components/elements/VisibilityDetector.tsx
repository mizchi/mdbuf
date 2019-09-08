import React, { useEffect } from "react";
import { useWriter } from "../../contexts/WriterContext";
import { AppInstallButton } from "./AppInstallButton";
import { useUpdate } from "../helpers";
import { useRemote } from "../../contexts/RemoteContext";
import { useCurrentBuffer } from "../../contexts/CurrentBufferContext";

// Restore state on active tab
export function VisibilityDetector() {
  const writer = useWriter();
  const remote = useRemote();
  const update = useUpdate();
  const buffer = useCurrentBuffer();
  useEffect(() => {
    const onVisibilityChange = async (_ev: any) => {
      if (writer.handler == null && document.visibilityState) {
        const lastState = await remote.getLastState();
        console.log("lastState received", lastState.raw);
        update(lastState.raw);
        if (buffer) buffer.setValue(lastState.raw);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [buffer, writer.handler]);
  return <></>;
}
