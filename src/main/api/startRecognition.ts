const _SpeechRecognition: any =
  (global as any).webkitSpeechRecognition || (global as any).SpeechRecognition;

export const startRecognition = (options: { onResult?: Function } = {}) => {
  const recognition = new _SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.continuous = true;

  return {
    stop: recognition.stop,
    abort: recognition.abort,

    promise: new Promise((resolve, reject) => {
      let results: any = [];

      recognition.onresult = (event: any) => {
        console.log("result", event.results);
        options.onResult && options.onResult(event.results);
        results = event.results;
      };

      recognition.onend = (_event: any) => {
        console.log("SpeechRecogintion: end");
        resolve(results);
      };

      recognition.onnomatch = (_event: any) => {
        console.log("SpeechRecogintion: nomatch");
      };

      recognition.onerror = (_event: any) => {
        console.log("SpeechRecogintion: on error");
        reject();
      };

      recognition.start();
    })
  };
};
