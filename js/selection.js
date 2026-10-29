// What the visitor is looking at: the pair, its colour, and the EU size the slip measured
// (footSize stays null until they put in a length themselves).
export const createSelection = (initial) => {
  let state = { ...initial };
  const listeners = new Set();
  return {
    get: () => state,
    set: (changes) => { state = { ...state, ...changes }; listeners.forEach((listener) => listener(state)); },
    watch: (listener) => { listeners.add(listener); listener(state); },
  };
};
