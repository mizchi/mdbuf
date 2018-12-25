import React, { useEffect, useState, useCallback } from "react";
import * as ipfsUtils from "../../api/ipfsUtils";
import { useAppState } from "../../contexts/RootStateContext";
import IPFS from "ipfs";

type State = {
  node: any | null;
  uploading: boolean;
  lastSharedRaw: string;
  sharedHash: string | null;
};

// reuse connection
let ipfsNode: any = null;

export default function Share() {
  const app = useAppState();
  const [state, setState] = useState<State>({
    node: null,
    uploading: false,
    lastSharedRaw: "",
    sharedHash: null
  });

  useEffect(() => {
    if (ipfsNode == null) {
      ipfsNode = new IPFS({ repo: String(Math.random() + Date.now()) });
      console.log("start connection");
      ipfsNode.on("ready", async () => {
        console.log("connected");
        setState(s => ({ ...s, node: ipfsNode }));
      });
    } else {
      setState(s => ({ ...s, node: ipfsNode }));
    }
  }, []);

  const onClickShare = useCallback(
    async ev => {
      ev.preventDefault();
      if (state.node != null) {
        setState(s => ({ ...s, uploading: true }));
        const hash = await ipfsUtils.shareText(state.node, app.raw);
        console.log("shared", hash);
        setState(s => ({
          ...s,
          uploading: false,
          sharedHash: hash,
          lastSharedRaw: app.raw
        }));
      }
    },
    [state.node, app.raw]
  );
  return (
    <div style={{ padding: 10, wordBreak: "break-word" }}>
      <h4>IPFS</h4>
      {state.node == null ? (
        <>...</>
      ) : (
        <>
          <button
            disabled={app.raw === state.lastSharedRaw}
            onClick={onClickShare}
          >
            Share this buffer
          </button>
          {state.sharedHash && (
            <>
              <div>
                <span>link:&nbsp;</span>
                <a
                  href={`https://gateway.ipfs.io/ipfs/${state.sharedHash}`}
                  target="_blank"
                >
                  {`https://gateway.ipfs.io/ipfs/${state.sharedHash}`}
                </a>
              </div>
            </>
          )}
          <p>
            NOTICE: Publishing data will be shared on IPFS (P2P Network).
            <br />
            You have to open this app as P2P node at first to deliver.
          </p>
        </>
      )}
    </div>
  );
}
