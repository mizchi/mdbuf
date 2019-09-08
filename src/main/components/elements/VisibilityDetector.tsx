import React, { useEffect } from "react";
import { useCurrentBuffer } from "../../contexts/CurrentBufferContext";
import { useRemote } from "../../contexts/RemoteContext";
import { useWriter } from "../../contexts/WriterContext";
import * as actions from "../../../shared/reducers";
import { useAction } from "../helpers";

// Restore state on active tab
export function VisibilityDetector() {
  const writer = useWriter();
  const remote = useRemote();
  const buffer = useCurrentBuffer();
  const sync = useAction(actions.sync);
  useEffect(() => {
    const onVisibilityChange = async (_ev: any) => {
      if (writer.handler == null && document.visibilityState) {
        const otherState = await remote.getLastState();
        sync(otherState);
        if (buffer) buffer.setValue(otherState.raw);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [buffer, writer.handler]);
  return <></>;
}
