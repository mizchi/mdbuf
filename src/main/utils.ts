export function sendGA(...args: any) {
  if (typeof ga !== "undefined") {
    setTimeout(() => {
      try {
        ga(...args);
      } catch (e) {}
    }, 0);
  }
}
