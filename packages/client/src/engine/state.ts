import { Rule } from './rules';
import { createStore } from "solid-js/store";

export interface Resource {
  value: number,
  rate: number|null
}

export interface Action {
  name: string,
  desc: string,
  targeted?: boolean,
  requires?: Record<string, number>,
}

export interface State {
  resources: Record<string, Resource>,
  actions: Record<string, Action>,
  history: string[],
  rules: Rule[],
}

export const initialState: State = {
  resources: {
    energy: {
      value: 12,
      rate: 0,
    },
    hamburgers: {
      value: 10,
      rate: null,
    },
    thoughts: {
      value: 7,
      rate: null,
    },
    mushrooms: {
      value: 81,
      rate: null,
    }
  },
  actions: {
    eatHamburger: {
      name: "Eat Hamburger",
      desc: "${actor} ate a hamburger.",
      requires: {
        hamburgers: 1,
      }
    },
    makeHamburger: {
      name: "Make Hamburger",
      desc: "${actor} made a hamburger.",
    },
    think: {
      name: "Think",
      desc: "${actor} had a thought.",
    },
    gatherShroom: {
      name: "Gather shroom",
      desc: "${actor} picked a shroom.",
    },
    buildShroomFarm: {
      name: "Build a shroom farm",
      desc: "${actor} built a shroom farm.",
      requires: {
        hamburgers: 20,
      },
    },
    research: {
      name: "Research",
      desc: "${actor} researched for a bit.",
      requires: {
        thoughts: 10,
      },
    },
    stealHat: {
      name: "Steal someone's hat",
      desc: "${actor} stole ${target}'s hat!",
      requires: {
        energy: 10,
        thoughts: 10,
      },
      targeted: true,
    }
  },
  history: [],
  rules: [{
    type: 'conditional',
    condition: {
      type: 'resource',
      name: 'energy',
      operator: '<=',
      value: 0,
    },
    consequence: {
      type: 'die',
    }
  }, {
    type: 'conditional',
    condition: {
      type: 'resource',
      name: 'mushrooms',
      operator: '>=',
      value: 1e8,
    },
    consequence: {
      type: 'win',
    }
  }, {
    type: 'action',
    action: 'makeHamburger',
    consequence: {
      type: 'gainResource',
      name: 'hamburgers',
      value: 1,
    }
  }, {
    type: 'action',
    action: 'eatHamburger',
    consequence: {
      type: 'gainResource',
      name: 'energy',
      value: 1,
    }
  }, {
    type: 'action',
    action: 'gatherShroom',
    consequence: {
      type: 'gainResource',
      name: 'mushrooms',
      value: 1,
    }
  }, {
    type: 'action',
    action: 'buildShroomFarm',
    consequence: {
      type: 'changeRate',
      name: 'mushrooms',
      value: 1,
    }
  }, {
    type: 'action',
    action: 'think',
    consequence: {
      type: 'gainResource',
      name: 'thoughts',
      value: 1,
    }
  }]
}

export type Actions = typeof initialState.actions;
export type ActionName = keyof Actions;
export type Resources = typeof initialState.resources;
export type ResourceName = keyof Resources;

// Pretend MUD
const [state, setState] = createStore(initialState);
export {state, setState};