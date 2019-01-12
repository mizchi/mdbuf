import React, { useState, useEffect } from "react";
import { useAppState } from "../../contexts/RootStateContext";
import * as diff from "diff";
import { startRecognition } from "../../api/startRecognition";
import { PatchWithTimestamp } from "../../../types";
import { Replayer } from "../_atoms/Replayer";

type State = {
  startedAt: number;
  recording: boolean;
  lastRaw: string;
  start: string;
  replaying: boolean;
  patches: PatchWithTimestamp[];
};

const initialState: State = {
  recording: false,
  replaying: false,
  startedAt: 0,
  lastRaw: "",
  start: "",
  patches: []
};

export function Recorder() {
  const app = useAppState();
  const [state, setState] = useState(initialState);

  useEffect(
    () => {
      if (state.recording) {
        (async () => {
          console.log("start recoginition");
          startRecognition();
        })();
      }
    },
    [state.recording]
  );

  // record text
  useEffect(
    () => {
      if (state.recording && app.raw !== state.lastRaw) {
        const patch = diff.createPatch("temp", state.lastRaw, app.raw, "", "");
        setState(s => ({
          ...s,
          lastRaw: app.raw,
          patches: [
            ...state.patches,
            {
              value: patch,
              timestamp: Date.now() - state.startedAt
            }
          ]
        }));
      }
    },
    [app.raw, state.lastRaw]
  );
  return (
    <div style={{ padding: 10 }}>
      <h3>Recorder (Experimental)</h3>

      {state.recording ? (
        <button
          onClick={() => {
            setState(s => ({ ...s, recording: false }));
          }}
        >
          stop
        </button>
      ) : (
        <button
          onClick={() => {
            setState(_s => ({
              start: app.raw,
              lastRaw: app.raw,
              patches: [],
              recording: true,
              replaying: false,
              startedAt: Date.now()
            }));
          }}
        >
          start
        </button>
      )}
      <div>patches: {state.patches.length}</div>

      {!state.recording && state.patches.length > 0 && (
        <>
          <hr />
          <button
            onClick={() => {
              setState(s => ({ ...s, replaying: !s.replaying }));
            }}
          >
            toggle replaying
          </button>
          {state.replaying && (
            <Replayer start={state.start} patches={state.patches} />
          )}
        </>
      )}
    </div>
  );
}
