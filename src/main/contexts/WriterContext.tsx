import React, { useContext, useState, useCallback } from "react";

export const WriterContext = React.createContext<{
  handler: any;
  timestamp: number;
  write(handler: any, text: string): Promise<void>;
  open(useCurrent?: boolean): Promise<any>;
  close(): Promise<void>;
}>(null as any);

export const Provider = function(props: { children: any }) {
  const [handler, setHandler] = useState(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  const open = useCallback(
    async (useCurrent: boolean = true) => {
      if (handler != null && useCurrent) {
        return handler;
      }
      // @ts-ignore
      const newHandler = await window.chooseFileSystemEntries({
        type: "saveFile",
        accepts: [
          {
            description: "Markdown file",
            extensions: ["md"],
            mimeTypes: ["text/markdown"]
          }
        ]
      });
      setHandler(newHandler);
      return newHandler;
    },
    [handler]
  );

  const close = useCallback(async () => {
    setHandler(null);
    setTimestamp(Date.now());
  }, [handler]);

  const write = useCallback(
    async (handler: any, text: string) => {
      setTimestamp(Date.now());
      await writeFile(handler, text);
    },
    [handler]
  );

  return (
    <WriterContext.Provider value={{ handler, close, open, timestamp, write }}>
      {props.children}
    </WriterContext.Provider>
  );
};

export const useWriter = () => {
  return useContext(WriterContext);
};

async function writeFile(handler: any, text: string): Promise<void> {
  const writer = await handler.createWriter();
  await writer.truncate(0);
  await writer.write(0, text);
  await writer.close();
}
