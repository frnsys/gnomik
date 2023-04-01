import api from './api';
import { Consequence } from './rules';
import { Resources, ActionName } from './state';
import update, { Spec } from 'immutability-helper';

// Take an action, applying any rules for it
// Returns true if action was successfully taken
export function tryTakeAction(key: ActionName): boolean {
  // Check if this action has any requirements
  let actions = api.actions.get();
  let action = actions[key];

  if (action.requires) {
    let resources = api.resources.get();
    let canAfford = Object.entries(action.requires).every(([k, amount]) => {
      return resources[k].value >= amount;
    });

    if (!canAfford) return false;

    // Pay resources
    let updates: Spec<Resources> = {};
    Object.entries(action.requires).every(([k, amount]) => {
      (updates as any)[k] = {value: {$set: resources[k].value - amount}};
    });
    let newState = update(resources, updates);
    api.resources.set(newState);
  }

  // Find rules for this action
  let rules = api.rules.get();
  rules
    .filter((rule) => rule.type == 'action')
    .forEach((rule) => {
      if (rule.type == 'action' && rule.action == key) {
        applyConsequence(rule.consequence);
      }
    });

  return true;
}

export function applyConsequence(conseq: Consequence) {
  let resources = api.resources.get();
  switch(conseq.type) {
    case 'win':
      alert('you win'); // TODO
      return;
    case 'die':
      alert('you\'re dead'); // TODO
      return;
    case 'gainResource':
      api.resources.set(update(resources, {
        [conseq.name]: {value: {$set: resources[conseq.name].value + conseq.value}}
      }));
      return;
    case 'loseResource':
      api.resources.set(update(resources, {
        [conseq.name]: {value: {$set: resources[conseq.name].value - conseq.value}}
      }));
      return;
  }
}

// Apply rate updates to resources
export function applyRates() {
  let updates: Spec<Resources> = {};
  let resources = api.resources.get();
  Object.entries(resources).forEach(([k, d]) => {
    if (d.rate !== null) {
      (updates as any)[k] = {value: {$set: d.value + d.rate}};
    }
  });
  let newState = update(resources, updates);
  api.resources.set(newState);
}
