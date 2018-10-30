import "@babel/polyfill";
import "./env";

import Proxy from "./lib/WorkerProxy";

import React, { SyntheticEvent } from "react";
import ReactDOM from "react-dom";

type State = {
  loaded: boolean;
  wordCount: number;
  raw: string;
  html: string;
  showPreview: boolean;
};

let proxy: any = null;

let isComposing = false;
const SHOW_PREVIEW_KEY = "show-preview";
const TAB_STR = "  ";

class App extends React.Component<{}, State> {
  editorRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
  previewRef: React.RefObject<HTMLDivElement> = React.createRef();
  previewContainerRef: React.RefObject<HTMLDivElement> = React.createRef();

  state = {
    raw: "",
    html: "",
    wordCount: 0,
    loaded: false,
    showPreview: true
  };

  _updatePreview(raw: String): Promise<void> {
    return new Promise(async resolve => {
      const result = await proxy.compile(raw);
      this.setState(
        {
          html: result
        },
        resolve
      );
      return;
    });
  }

  async componentDidMount() {
    const val = window.localStorage.getItem(SHOW_PREVIEW_KEY);
    let showPreview: boolean = val ? JSON.parse(val) : true;

    proxy = await new Proxy();
    const lastState = await proxy.getLastState();

    this.setState({
      showPreview,
      wordCount: Array.from(lastState.raw).length,
      raw: lastState.raw,
      html: lastState.html,
      loaded: true
    });

    if (this.editorRef.current) {
      this.editorRef.current.focus();
    }

    window.addEventListener("keydown", async ev => {
      if (ev.ctrlKey && ev.key === "1") {
        ev.preventDefault();
        localStorage.setItem(SHOW_PREVIEW_KEY, String(!this.state.showPreview));
        this.setState({ showPreview: !this.state.showPreview });
        return;
      }

      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "f") {
        ev.preventDefault();

        if (this.editorRef.current) {
          const raw = this.editorRef.current.value;
          const formatted = await proxy.format(raw);
          this.editorRef.current.value = formatted;
          this._updatePreview(formatted);
        }
        return;
      }

      // keybind scroll
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "j") {
        ev.preventDefault();
        if (this.previewContainerRef.current) {
          const scrollTop = this.previewContainerRef.current.scrollTop;
          this.previewContainerRef.current.scrollTop = scrollTop + 50;
        }
        return;
      }

      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        if (this.previewContainerRef.current) {
          const scrollTop = this.previewContainerRef.current.scrollTop;
          this.previewContainerRef.current.scrollTop = scrollTop - 50;
        }
      }
    });
  }

  async onChangeValue(ev: SyntheticEvent<HTMLTextAreaElement>) {
    if (isComposing) {
      return;
    }
    const rawValue = (ev.target as any).value;
    this.setState({
      wordCount: Array.from(rawValue).length
    });

    console.time("compile:worker");
    await this._updatePreview(rawValue);
    console.timeEnd("compile:worker");
  }

  render() {
    if (!this.state.loaded) {
      return (
        <div style={{ padding: 18 }}>
          <span style={{ color: "white" }}>Loading...</span>
        </div>
      );
    }

    return (
      <>
        <div style={{ flex: 1, height: "100vh" }}>
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "960px",
                marginLeft: "auto",
                marginRight: "auto",
                paddingTop: "8px"
              }}
            >
              <textarea
                ref={this.editorRef}
                className="js-editor editor"
                spellCheck={false}
                defaultValue={this.state.raw}
                onChange={this.onChangeValue.bind(this)}
                onCompositionStart={() => {
                  isComposing = true;
                }}
                onCompositionEnd={ev => {
                  isComposing = false;
                  this.onChangeValue(ev);
                }}
                onKeyDown={e => {
                  // Tab Indent
                  if (e.keyCode === 9 && !isComposing) {
                    e.preventDefault();
                    const el: HTMLTextAreaElement = e.target as any;
                    let start: number = el.selectionStart;
                    let end: number = el.selectionEnd;
                    const raw = el.value;
                    const lineStart =
                      raw.substr(0, start).split("\n").length - 1;
                    const lineEnd = raw.substr(0, end).split("\n").length - 1;
                    const lines = raw.split("\n");
                    lines.forEach((line, i) => {
                      if (i < lineStart || i > lineEnd || lines[i] === "") {
                        return;
                      }
                      if (!e.shiftKey) {
                        // 行頭にタブ挿入
                        lines[i] = TAB_STR + line;
                        start += i == lineStart ? TAB_STR.length : 0;
                        end += TAB_STR.length;
                      } else if (
                        lines[i].substr(0, TAB_STR.length) === TAB_STR
                      ) {
                        // 行頭のタブ削除
                        lines[i] = lines[i].substr(TAB_STR.length);
                        start -= i == lineStart ? TAB_STR.length : 0;
                        end -= TAB_STR.length;
                      }
                    });
                    const newRaw = lines.join("\n");
                    el.value = newRaw;
                    el.setSelectionRange(start, end);
                    this._updatePreview(newRaw);
                  }
                }}
                onWheel={ev => {
                  console.log("wheel", ev.ctrlKey);
                  if (ev.ctrlKey) {
                    ev.preventDefault();
                    console.log("prevented");
                    if (this.previewContainerRef.current) {
                      const scrollTop = this.previewContainerRef.current
                        .scrollTop;
                      this.previewContainerRef.current.scrollTop =
                        scrollTop + ev.deltaY;
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        {this.state.showPreview && (
          <div
            ref={this.previewContainerRef}
            style={{
              flex: 1,
              height: "100vh",
              overflowY: "auto",
              background: "#eee"
            }}
          >
            <div style={{ overflowY: "auto" }}>
              <div
                ref={this.previewRef}
                className="markdown-body"
                style={{ padding: "10px", lineHeight: "1.3em" }}
                dangerouslySetInnerHTML={{ __html: this.state.html }}
              />
            </div>
          </div>
        )}
        <div style={{ position: "absolute", right: "20px", bottom: "20px" }}>
          <span style={{ fontFamily: "monospace", color: "cornflowerblue" }}>
            {this.state.wordCount}
          </span>
          &nbsp;
          <button
            onClick={() => {
              localStorage.setItem(
                SHOW_PREVIEW_KEY,
                String(!this.state.showPreview)
              );

              this.setState({ showPreview: !this.state.showPreview });
            }}
          >
            👀
          </button>
        </div>
      </>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
