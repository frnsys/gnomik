import api from './api';
import update, { Spec } from 'immutability-helper';
import { Resources, ResourceName, ActionName } from './state';
import { Condition, Consequence, CapacityRule, RevealRule } from './rules';

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
      let limit = limitForResource(conseq.name);
      let amount = resources[conseq.name].value + conseq.value;
      api.resources.set(update(resources, {
        [conseq.name]: {value: {$set: limit !== null ? Math.min(amount, limit) : amount}}
      }));
      return;
    case 'loseResource':
      api.resources.set(update(resources, {
        [conseq.name]: {value: {$set: resources[conseq.name].value - conseq.value}}
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

// Calculate rate for resource
export function rateForResource(name: ResourceName): number {
  let rules = api.rules.get();
  let resources = api.resources.get();
  let rate = rules
    .reduce((acc, rule) => {
      if (rule.type == 'rate' && rule.resource == name) {
        return acc + rule.value * resources[rule.basis].value;
      } else {
        return acc;
      }
    }, 0);
  return rate;
}

export function limitForResource(name: ResourceName): number|null {
  let rules = api.rules.get();
  let resources = api.resources.get();
  let relevantRules = rules
    .filter((rule) => rule.type == 'capacity' && rule.resource == name) as CapacityRule[];

  // No limit
  if (relevantRules.length === 0) return null;

  return relevantRules.reduce((acc, rule) => {
    return acc + rule.value * resources[rule.basis].value;
  }, 0);
}

export function visibilityForResource(name: ResourceName): boolean {
  let rules = api.rules.get();
  let relevantRules = rules
    .filter((rule) => rule.type == 'reveal' && rule.target.type == 'resource' && rule.target.name == name) as RevealRule[];

  if (relevantRules.length == 0) return true;

  let resources = api.resources.get();
  return relevantRules.every((rule) => resources[rule.basis].value >= rule.value);
}

export function visibilityForAction(name: ActionName): boolean {
  let rules = api.rules.get();
  let relevantRules = rules
    .filter((rule) => rule.type == 'reveal' && rule.target.type == 'action' && rule.target.name == name) as RevealRule[];

  if (relevantRules.length == 0) return true;

  let resources = api.resources.get();
  return relevantRules.every((rule) => resources[rule.basis].value >= rule.value);
}

// Apply rate updates to resources
export function applyRates() {
  let updates: Spec<Resources> = {};
  let resources = api.resources.get();
  Object.entries(resources).forEach(([k, d]) => {
    let rate = rateForResource(k);
    if (rate !== 0) {
      let limit = limitForResource(k);
      let amount = d.value + rate;
      (updates as any)[k] = {value: {$set: limit !== null ? Math.min(amount, limit) : amount}};
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
