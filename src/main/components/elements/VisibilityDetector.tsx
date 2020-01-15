import React, { useEffect } from "react";
import { useCurrentBuffer } from "../../contexts/CurrentBufferContext";
import { useWriter } from "../../contexts/WriterContext";
import * as actions from "../../reducers";
import { useAction } from "../_hooks/commands";
import { getLastState } from "../../store/createStore";

// Restore state on active tab
export function VisibilityDetector() {
  const writer = useWriter();
  const buffer = useCurrentBuffer();
  const sync = useAction(actions.sync);
  useEffect(() => {
    const onVisibilityChange = async (_ev: any) => {
      if (writer.handler == null && document.visibilityState) {
        const otherState = await getLastState();
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
