import React, { useEffect, useState, useCallback } from "react";
import * as ipfsUtils from "../../api/ipfsUtils";
import { useAppState } from "../../contexts/RootStateContext";
import { Item, WorkerAPI } from "../../../types";
import { useWorkerAPI } from "../../contexts/WorkerAPIContext";
import sortBy from "lodash.sortby";

// reuse connection on session
let ipfsNode: any = null;

export default () => {
  const app = useAppState();
  return (
    <Share
      raw={app.raw}
      repo={app.ipfsRepo || Date.now().toString() + Math.random().toString()}
    />
  );
};

type Props = {
  raw: string;
  repo: string;
};

type State = {
  uploading: boolean;
  nodeLoaded: boolean;
  lastSharedRaw: string;
  items: Array<Item>;
};

function Share(props: Props) {
  const api = useWorkerAPI();

  const [state, setState] = useState<State>({
    items: [],
    uploading: false,
    nodeLoaded: !!ipfsNode,
    lastSharedRaw: ""
  });

  // update onChange
  useEffect(() => {
    (async () => {
      const items = await getSortedItems(api);
      setState(s => ({ ...s, items }));
    })();
    // props.onChangeState(state);
  }, []);

  useEffect(() => {
    if (ipfsNode == null) {
      ipfsNode = ipfsUtils.getIpfsNode(props.repo);
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
        setState(s => ({ ...s, uploading: true, hash: null }));
        const hash = await ipfsUtils.shareText(ipfsNode, props.raw);

        await api.saveItem({
          raw: props.raw,
          id: hash
        });

        const items = await api.getAllItems();
        const itemsSorted = sortBy(items, (i: Item) => i.updatedAt).reverse();

        setState(s => ({
          ...s,
          items: itemsSorted,
          uploading: false,
          sharedHash: hash,
          lastSharedRaw: props.raw
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
          <p>
            NOTICE: Publishing data will be shared on IPFS (P2P Network).
            <br />
            You have to open this app as P2P node at first to deliver.
          </p>

          <button
            disabled={props.raw === state.lastSharedRaw}
            onClick={onClickShare}
          >
            Share current buffer
          </button>
          {state.items.map(item => {
            return (
              <IpfsObjectStatus
                updatedAt={item.updatedAt}
                hash={item.id}
                title={item.raw.split("\n")[0]}
                key={item.id}
                onClickRetry={async () => {
                  await ipfsUtils.shareText(ipfsNode, item.raw);
                  console.log("retry");
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

function IpfsObjectStatus(props: {
  hash: string;
  title: string;
  updatedAt: number;
  onClickRetry: () => void;
}) {
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
      <hr />
      <div>
        <span>{new Date(props.updatedAt).toString()}</span>|
        <span>{state.status}</span>
        {state.status !== "delivered" && (
          <button onClick={() => props.onClickRetry()}>retry</button>
        )}
      </div>
      <div>
        <pre>{props.title}</pre>:
      </div>
      <div>
        <a href={link} target="_blank">
          {link}
        </a>
      </div>
    </div>
  );
}

async function getSortedItems(api: WorkerAPI) {
  const items = await api.getAllItems();
  return sortBy(items, (i: Item) => i.updatedAt).reverse();
}
