// import { setup } from "./mud/setup";
// export const { components, worldSend } = await setup();

// Dummy state
import { createEffect } from "solid-js";
import { State, state, setState } from './state';

function createAPI<K extends keyof State>(key: K) {
  return {
    get(): State[K] {
      return state[key];
    },
    set(data: State[K]) {
      // TODO
      // const increment = async () => {
      //   const tx = await worldSend("increment", []);
      //   console.log("increment tx", tx);
      //   console.log("increment result", await tx.wait());
      // }
      let newState = {...state};
      newState[key] = data;
      setState(newState);
    },
    subscribe(fn: (state: State[K]) => void) {
      // TODO
      // components.CounterTable.update$.subscribe((update) => {
      //   const [nextValue, _prevValue] = update.value;
      //   setCounter(nextValue?.value ?? 0)
      // });
      createEffect(() => {
        fn(state[key]);
      });
    },
  }
}

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

const api = {
  actions: createAPI('actions'),
  resources: createAPI('resources'),
  history: createAPI('history'),
  rules: createAPI('rules'),

  player: genRanHex(8),
  otherPlayers: [
    genRanHex(8),
    genRanHex(8),
    genRanHex(8),
    genRanHex(8),
    genRanHex(8),
  ]
};
export default api;
