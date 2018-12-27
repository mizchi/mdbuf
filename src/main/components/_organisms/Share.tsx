import React, { useEffect, useState, useCallback } from "react";
import * as ipfsUtils from "../../api/ipfsUtils";
import { useAppState, useDispatch } from "../../contexts/RootStateContext";
import IPFS from "ipfs";
import { ShareState } from "../../../types";
import { updateShareState } from "../../reducers";
import { useWorkerAPI } from "../../contexts/WorkerAPIContext";

// reuse connection on session
let ipfsNode: any = null;

export default () => {
  const api = useWorkerAPI();

  const app = useAppState();
  const dispatch = useDispatch();

  const onChangeShareState = useCallback((share: ShareState) => {
    dispatch(updateShareState(share));
  }, []);

  const onCreateDocument = useCallback(() => {
    // wip
  }, []);

  return (
    <Share
      initialState={app.share}
      raw={app.raw}
      onChangeState={onChangeShareState}
      onCreateDocument={onCreateDocument}
    />
  );
};

type Props = {
  initialState?: ShareState | null;
  raw: string;
  onChangeState: (state: State) => void;
  onCreateDocument: () => void;
};

type State = ShareState;

function Share(props: Props) {
  const [state, setState] = useState<State>(
    props.initialState != null
      ? // migration
        {
          uploadHistory: [],
          ...props.initialState,
          nodeLoaded: !!ipfsNode
        }
      : // initialize
        {
          repo: String(Math.random() + Date.now()),
          uploading: false,
          nodeLoaded: !!ipfsNode,
          lastSharedRaw: "",
          uploadHistory: []
        }
  );

  // update onChange
  useEffect(
    () => {
      props.onChangeState(state);
    },
    [state]
  );

  useEffect(() => {
    if (ipfsNode == null) {
      ipfsNode = new IPFS({ repo: state.repo });
      console.log("start connection");
      ipfsNode.on("ready", async () => {
        console.log("connected");
        setState(s => ({ ...s, nodeLoaded: true }));
      });
    }
  }, []);

  const onClickShare = useCallback(
    async ev => {
      ev.preventDefault();
      if (ipfsNode != null) {
        const title = props.raw.split("\n")[0];

        setState(s => ({ ...s, uploading: true, hash: null }));
        const hash = await ipfsUtils.shareText(ipfsNode, props.raw);
        const uploaded = {
          title,
          hash
        };

        setState(s => ({
          ...s,
          uploading: false,
          sharedHash: hash,
          lastSharedRaw: props.raw,
          uploadHistory: [uploaded, ...s.uploadHistory]
        }));
      }
    },
    [state.nodeLoaded, props.raw]
  );

  return (
    <div style={{ padding: 10, wordBreak: "break-word" }}>
      <h4>IPFS</h4>
      {ipfsNode == null ? (
        <>...</>
      ) : (
        <>
          <button
            disabled={props.raw === state.lastSharedRaw}
            onClick={onClickShare}
          >
            Share current buffer
          </button>
          {state.uploadHistory.map(item => {
            return (
              <IpfsObjectStatus
                hash={item.hash}
                title={item.title}
                key={item.hash}
              />
            );
          })}
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

function IpfsObjectStatus(props: { hash: string; title: string }) {
  const [state, setState] = useState<{
    status: "delivering..." | "delivered" | "error";
  }>({ status: "delivering..." });
  const link = ipfsUtils.getIpfsLink(props.hash);

  useEffect(() => {
    (async () => {
      try {
        await ipfsUtils.ensureGatewayCache(props.hash);
        setState({ status: "delivered" });
      } catch (e) {
        setState({ status: "error" });
      }
    })();
  }, []);

  return (
    <div>
      <span>{props.title}</span>:
      <a href={link} target="_blank">
        {link}
      </a>
      :<span>{state.status}</span>
    </div>
  );
}
