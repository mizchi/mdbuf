import React, { useContext, useState, useCallback } from "react";

type State = {
  buffer: HTMLTextAreaElement | null;
  type: "textarea";
};

export const CurrentBufferContext = React.createContext<
  State & {
    focus(): void;
    setBuffer(type: string, buffer: null | any): void;
    setValue(value: string): void;
  }
>(null as any);

export const Provider = function(props: { children: any }) {
  const [state, setState] = useState<State>({
    type: "textarea",
    buffer: null
  });
  const setBuffer = useCallback(
    (type: "textarea", buffer: HTMLTextAreaElement) => {
      setState({ type, buffer });
    },
    []
  );

  const focus = useCallback(() => {
    if (
      state.type === "textarea" &&
      state.buffer instanceof HTMLTextAreaElement
    ) {
      state.buffer.focus();
    }
  }, [state.buffer, state.type]);

  const setValue = useCallback(
    (value: string) => {
      if (
        state.type === "textarea" &&
        state.buffer instanceof HTMLTextAreaElement
      ) {
        state.buffer.value = value;
      }
    },
    [state.buffer, state.type]
  );

  return (
    <CurrentBufferContext.Provider
      value={{
        buffer: state.buffer,
        type: state.type,
        focus,
        setBuffer,
        setValue
      }}
    >
      {props.children}
    </CurrentBufferContext.Provider>
  );
};

export const useCurrentBuffer = () => {
  return useContext(CurrentBufferContext);
};
