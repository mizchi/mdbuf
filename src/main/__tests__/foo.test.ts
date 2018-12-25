import { diff, patch, Delta } from "jsondiffpatch";

let s0 = `
a
`;
let s1 = `
aaaa
`;

let s2 = `
aaaa
bbbb
`;

let s3 = `
aaaa
bbbb
cc
`;

let s4 = `
bbbb
cc
`;

let s5 = `
aaaa

cc
`;

const createDeltas = (changes: string[]) => {
  const seq = changes.map(s => s.split("\n"));
  const [, deltas] = seq.slice(1).reduce(
    ([prev, deltas]: any, next) => {
      const delta = diff(prev, next);
      return [next, [...deltas, delta]];
    },
    [seq[0], [] as Delta[]]
  );
  return deltas;
};

const applyDeltas = (
  start: string,
  deltas: Delta[],
  fn: (next: string) => void
) => {
  let s = start.split("\n");
  deltas.forEach((delta: Delta) => {
    patch(s, delta);
    fn(s.join("\n"));
  });
  return s;
};

const changes = [s0, s1, s2, s3, s4, s5];
const deltas = createDeltas(changes);

applyDeltas(changes[0], deltas, value => {
  console.log(value);
});

test("sample", () => {
  // do
});
