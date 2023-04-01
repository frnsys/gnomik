import api from './api';
import { Condition, Consequence } from './rules';
import { Resources, ResourceName, ActionName } from './state';
import update, { Spec } from 'immutability-helper';

// Take an action, applying any rules for it
// Returns true if action was successfully taken
export function tryTakeAction(key: ActionName): boolean {
  // Check if this action has any requirements
  let actions = api.actions.get();
  let action = actions[key];

  if (action.requires && Object.values(action.requires).some((v) => v > 0) && !tryPayResources(action.requires)) {
    return false;
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
      console.log('you win'); // TODO
      return;
    case 'die':
      console.log('you\'re dead'); // TODO
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
    case 'changeRate':
      api.resources.set(update(resources, {
        [conseq.name]: {rate: {$set: (resources[conseq.name].rate || 0) + conseq.value}}
      }));
      return;
  }
}

export function tryPayResources(requires: Record<ResourceName, number>): boolean {
  let resources = api.resources.get();
  let canAfford = Object.entries(requires).every(([k, amount]) => {
    return resources[k].value >= amount;
  });

  if (!canAfford) return false;

  // Pay resources
  let updates: Spec<Resources> = {};
  Object.entries(requires).every(([k, amount]) => {
    (updates as any)[k] = {value: {$set: resources[k].value - amount}};
  });
  let newState = update(resources, updates);
  api.resources.set(newState);
  return true;
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

function checkCondition(cond: Condition): boolean {
  let resources = api.resources.get();
  switch (cond.type) {
    case 'resource':
      switch (cond.operator) {
        case '==': return resources[cond.name].value == cond.value;
        case '<=': return resources[cond.name].value <= cond.value;
        case '>=': return resources[cond.name].value >= cond.value;
        case '<': return resources[cond.name].value < cond.value;
        case '>': return resources[cond.name].value > cond.value;
      }
  }
}

export function checkConditions() {
  let rules = api.rules.get();
  rules
    .filter((rule) => rule.type == 'conditional')
    .forEach((rule) => {
      if (rule.type == 'conditional') {
        if (checkCondition(rule.condition)) {
          applyConsequence(rule.consequence);
        }
      }
    });
}
