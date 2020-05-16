declare module "remark";
declare module "remark-*";
declare module "prettier/*";

declare var ResizeObserver: any;
declare var ga: any;

declare module "recoil" {
  export type RecoilState<T> = {};

  export const RecoilRoot: React.ComponentType<{
    initializeState?: (options: {
      set: <T>(recoilVal: RecoilState<T>, newVal: T) => void;
      setUnvalidatedAtomValues: (atomMap: Map<string, unknown>) => void;
      dangerouslyAllowMutability?: boolean;
    }) => void;
    children: any;
  }>;

  export function atom<T>(input: {
    key: string;
    default: ValueType;
  }): RecoilState<T>;

  export function selector<T>(input: {
    key: string;
    get(helpers: {
      get<U>(atom: RecoilState<U>): U;
      getPromise<U>(atom: RecoilState<U>): Promise<U>;
    }): T;
    set?(
      helpers: {
        set<U>(atom: RecoilState<U>, newVal: U): void;
      },
      newVal: T
    ): void;
  });

  export function useRecoilCallback(fn: any, keys: []): any;
  export function useRecoilValue<T>(atom: RecoilState<T>): T;
  export function useRecoilState<T>(
    atom: RecoilState<T>
  ): [T, (action: React.SetStateAction<T>) => void];
}
