import { PatchWithTimestamp } from "../../../types";
import React, { useState, useEffect } from "react";
import * as diff from "diff";

type State = {
  paused: boolean;
  current: string;
  index: number;
  progress: number;
  done: boolean;
  startedAt: number;
};

const pause = (payload: {}) => (s: State): State => ({
  ...s,
  paused: true
});

const restart = (payload: {
  patches: PatchWithTimestamp[];
  index?: number;
}) => (s: State): State => {
  const currentPatch =
    payload.patches[payload.index != null ? payload.index : s.index];
  const startedAt = Date.now() - currentPatch.timestamp;
  return {
    ...s,
    current: currentPatch.value,
    progress: currentPatch.timestamp,
    startedAt,
    paused: false,
    done: false
  };
};

const stepToNextPatch = (payload: { delta: number; next: string }) => (
  state: State
): State => ({
  ...state,
  progress: payload.delta,
  index: state.index + 1,
  current: payload.next
});

const stepEnd = (payload: { delta: number; next: string }) => (
  state: State
): State => ({
  ...state,
  progress: payload.delta,
  done: true,
  paused: true,
  current: payload.next
});

const getInitialState = (start: string): State => ({
  current: start,
  index: 0,
  paused: false,
  done: false,
  progress: 0,
  startedAt: Date.now()
});

export function Replayer(props: {
  start: string;
  patches: PatchWithTimestamp[];
}) {
  const [state, setState] = useState<State>(getInitialState(props.start));

  const maxLength =
    props.patches[props.patches.length - 1].timestamp -
    props.patches[0].timestamp;

  useEffect(
    () => {
      const checkloop = () => {
        if (state.done || state.paused) {
          return;
        }
        requestAnimationFrame(() => {
          const now = Date.now();
          const currentPatch = props.patches[state.index];
          const delta = now - state.startedAt;
          if (currentPatch && currentPatch.timestamp < delta) {
            const nextValue = diff.applyPatch(
              state.current,
              currentPatch.value
            );
            if (props.patches[state.index + 1]) {
              setState(stepToNextPatch({ next: nextValue, delta }));
            } else {
              setState(stepEnd({ next: nextValue, delta: maxLength }));
            }
          } else {
            checkloop();
          }
        });
      };
      checkloop();
    },
    [state.index, state.done, state.paused]
  );

  return (
    <div>
      <h4>Replayer</h4>
      <div>{`${state.progress} / ${maxLength}`}</div>
      {!state.paused && !state.done && (
        <button
          onClick={() => {
            setState(pause({}));
          }}
        >
          pause
        </button>
      )}

      {state.paused && (
        <button
          onClick={() => {
            setState(restart({ patches: props.patches }));
          }}
        >
          restart
        </button>
      )}
      {state.paused && state.done && (
        <button
          onClick={() => {
            setState(pause({ index: 0 }));
          }}
        >
          pause
        </button>
      )}

      <pre>{state.current}</pre>
    </div>
  );
}
