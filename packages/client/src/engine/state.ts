import { Rule } from './rules';
import { createStore } from "solid-js/store";

export interface Resource {
  value: number,
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
      value: 10,
    },
    hamburgers: {
      value: 0,
    },
    thoughts: {
      value: 0,
    },
    mushrooms: {
      value: 0,
    },
    shroomFarms: {
      value: 0,
    },
    shroomFarmers: {
      value: 0,
    },
    gnomeDiscontent: {
      value: 0,
    },
    libraries: {
      value: 0,
    },
    cooks: {
      value: 0,
    },
    kitchens: {
      value: 0,
    }
  },
  actions: {
    makeHamburger: {
      name: "Make Hamburger",
      desc: "${actor} made a hamburger.",
    },
    think: {
      name: "Think",
      desc: "${actor} had a thought.",
      requires: {
        mushrooms: 1,
      }
    },
    gatherShroom: {
      name: "Gather shroom",
      desc: "${actor} picked a shroom.",
      requires: {
        hamburgers: 1,
      }
    },
    buildShroomFarm: {
      name: "Build a shroom farm",
      desc: "${actor} built a shroom farm.",
      requires: {
        mushrooms: 20,
      },
    },
    buildKitchen: {
      name: "Build a burger kitchen",
      desc: "${actor} built a burger kitchen.",
      requires: {
        mushrooms: 100,
      },
    },
    hireCook: {
      name: "Hire a cook",
      desc: "${actor} hired a cook.",
      requires: {
        hamburgers: 20,
      },
    },
    hireShroomFarmer: {
      name: "Hire a shroom farmer",
      desc: "${actor} hired a shroom farmer.",
      requires: {
        hamburgers: 10,
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
    },
    buildLibrary: {
      name: "Build a library",
      desc: "${actor} built a library.",
      requires: {
        shroomFarmers: 10,
      }
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
      type: 'gainResource',
      name: 'shroomFarms',
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
  }, {
    type: 'action',
    action: 'hireShroomFarmer',
    consequence: {
      type: 'gainResource',
      name: 'shroomFarmers',
      value: 1,
    }
  }, {
    type: 'rate',
    resource: 'mushrooms',
    basis: 'shroomFarmers',
    value: 1,
  }, {
    type: 'capacity',
    resource: 'shroomFarmers',
    basis: 'shroomFarms',
    value: 5,
  }, {
    type: 'rate',
    resource: 'gnomeDiscontent',
    basis: 'shroomFarmers',
    value: 1,
  }, {
    type: 'reveal',
    basis: 'shroomFarms',
    target: {
      type: 'resource',
      name: 'shroomFarmers'
    },
    value: 1,
  }, {
    type: 'reveal',
    basis: 'gnomeDiscontent',
    target: {
      type: 'resource',
      name: 'gnomeDiscontent',
    },
    value: 50,
  }, {
    type: 'reveal',
    basis: 'shroomFarms',
    target: {
      type: 'action',
      name: 'buildLibrary'
    },
    value: 2,
  }, {
    type: 'reveal',
    basis: 'libraries',
    target: {
      type: 'resource',
      name: 'libraries'
    },
    value: 1,
  }, {
    type: 'reveal',
    basis: 'shroomFarms',
    target: {
      type: 'action',
      name: 'hireShroomFarmer',
    },
    value: 1,
  }, {
    type: 'action',
    action: 'buildLibrary',
    consequence: {
      type: 'gainResource',
      name: 'libraries',
      value: 1,
    }
  }, {
    type: 'rate',
    resource: 'thoughts',
    basis: 'libraries',
    value: 1,
  }, {
    type: 'action',
    action: 'buildLibrary',
    consequence: {
      type: 'gainResource',
      name: 'gnomeDiscontent',
      value: 200,
    }
  }, {
    type: 'reveal',
    basis: 'mushrooms',
    target: {
      type: 'action',
      name: 'buildKitchen'
    },
    value: 100,
  }, {
    type: 'action',
    action: 'hireCook',
    consequence: {
      type: 'gainResource',
      name: 'cooks',
      value: 1,
    }
  }, {
    type: 'reveal',
    basis: 'cooks',
    target: {
      type: 'resource',
      name: 'cooks'
    },
    value: 1,
  }, {
    type: 'rate',
    basis: 'cooks',
    resource: 'hamburgers',
    value: 1,
  }, {
    type: 'reveal',
    basis: 'kitchens',
    target: {
      type: 'action',
      name: 'hireCook',
    },
    value: 1,
  }, {
    type: 'reveal',
    basis: 'kitchens',
    target: {
      type: 'resource',
      name: 'kitchens',
    },
    value: 1,
  }, {
    type: 'action',
    action: 'buildKitchen',
    consequence: {
      type: 'gainResource',
      name: 'kitchens',
      value: 1,
    }
  }, {
    type: 'reveal',
    basis: 'mushrooms',
    target: {
      type: 'action',
      name: 'buildShroomFarm',
    },
    value: 25,
  }, {
    type: 'reveal',
    basis: 'shroomFarms',
    target: {
      type: 'resource',
      name: 'shroomFarms',
    },
    value: 1,
  }, {
    type: 'capacity',
    basis: 'kitchens',
    resource: 'cooks',
    value: 5,
  }]
}

export type Actions = typeof initialState.actions;
export type ActionName = keyof Actions;
export type Resources = typeof initialState.resources;
export type ResourceName = keyof Resources;

// Pretend MUD
const [state, setState] = createStore(initialState);
export {state, setState};