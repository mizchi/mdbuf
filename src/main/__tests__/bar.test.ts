import * as diff from "diff";

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

const createPatches = (changes: string[]) => {
  const [, patches] = changes.slice(1).reduce(
    ([prev, deltas]: any, next) => {
      const delta = diff.createPatch("temp", prev, next, "", "");
      return [next, [...deltas, delta]];
    },
    [changes[0], [] as any]
  );
  return patches;
};

const applyPatches = (
  start: string,
  patches: any[],
  fn: (next: string) => void
) => {
  let s = start;
  patches.forEach((patch: any) => {
    s = diff.applyPatch(s, patch);
    fn(s);
  });
  return s;
};

const changes = [s0, s1, s2, s3, s4, s5];
const patches = createPatches(changes);

applyPatches(changes[0], patches, value => {
  console.log(value);
});

test("sample", () => {
  // do
});
