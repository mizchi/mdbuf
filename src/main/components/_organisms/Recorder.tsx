import React, { useState, useEffect } from "react";
import { useAppState } from "../../contexts/RootStateContext";
import * as diff from "diff";
import { startRecognition } from "../../api/startRecognition";

type PatchWithTimestamp = {
  value: string;
  timestamp: number;
};

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

type ReplayerState = {
  current: string;
  index: number;
  playing: boolean;
  startedAt: number;
};
function Replayer(props: {
  start: string;
  patches: {
    value: string;
    timestamp: number;
  }[];
}) {
  const [state, setState] = useState<ReplayerState>({
    current: props.start,
    index: 0,
    playing: true,
    startedAt: Date.now()
  });
  useEffect(
    () => {
      const checkloop = () => {
        if (!state.playing) {
          return;
        }
        requestAnimationFrame(() => {
          const now = Date.now();
          const currentPatch = props.patches[state.index];
          if (currentPatch && currentPatch.timestamp > now - state.startedAt) {
            const nextValue = diff.applyPatch(
              state.current,
              currentPatch.value
            );
            // debugger;
            if (props.patches[state.index + 1]) {
              setState(s => ({
                ...s,
                index: state.index + 1,
                current: nextValue
              }));
            } else {
              setState(s => ({
                ...s,
                playing: false,
                current: nextValue
              }));
            }
          } else {
            checkloop();
          }
        });
      };
      checkloop();
    },
    [state.index, state.playing]
  );
  return (
    <div>
      <h4>Replayer</h4>
      <pre>{state.current}</pre>
    </div>
  );
}
