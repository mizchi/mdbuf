import React, { useEffect, useState } from "react";
import { useWorkerAPI } from "../../contexts/WorkerAPIContext";
import { Item, AppState } from "../../../types";
import { useDispatch, useSelector } from "react-redux";

import { updateRaw } from "../../reducers";
import { sortBy } from "lodash-es";
import format from "date-fns/format";
import { FileSystemController } from "./FileSystemController";

export const Save = React.memo(
  (_props: { editorRef: React.RefObject<any> }) => {
    const api = useWorkerAPI();
    const app = useSelector((s: AppState) => ({ raw: s.raw }));
    const [items, setItems] = useState<Item[]>([]);
    const dispatch = useDispatch();

    useEffect(() => {
      (async () => {
        const newItems = await api.getAllItems();
        setItems(newItems);
      })();
    }, []);
    return (
      <div style={{ padding: 10 }}>
        <FileSystemController
          editorRef={_props.editorRef}
          onStartHandle={() => {}}
          onEndHandle={() => {}}
        />
        <hr />
        <div>
          <button
            onClick={async () => {
              await api.saveItem({
                raw: app.raw,
                id: Date.now().toString()
              });
              const nextItems = await api.getAllItems();
              setItems(nextItems);
            }}
          >
            save snapshot
          </button>
        </div>
        {sortBy(items, i => -i.updatedAt).map(item => {
          const formatted = format(new Date(item.updatedAt), "yyy/MM/dd");
          return (
            <div key={item.id}>
              <button
                onClick={async () => {
                  const data = await api.getItem({ id: item.id });
                  if (data) {
                    dispatch(updateRaw(data.raw));
                    if (_props.editorRef.current) {
                      _props.editorRef.current.focus();
                    }
                  }
                }}
              >
                load
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete ${item.id}. OK?`)) {
                    await api.deleteItem({ id: item.id });
                    const nextItems = await api.getAllItems();
                    setItems(nextItems);
                  }
                }}
              >
                delete
              </button>
              &nbsp;
              {formatted} -
              <code>
                {item.raw.split("\n")[0]}... {item.raw.length}
              </code>
            </div>
          );
        })}
      </div>
    );
  }
);
