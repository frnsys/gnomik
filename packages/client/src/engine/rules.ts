import { ActionName, ResourceName } from "./state";

export type Rule = ConditionalRule | ActionRule | RateRule | CapacityRule | RevealRule;

interface ConditionalRule {
  type: 'conditional',
  condition: Condition,
  consequence: Consequence,
}

interface ActionRule {
  type: 'action',
  action: ActionName,
  consequence: Consequence,
}

interface ResourceTarget {
  type: 'resource',
  name: ResourceName,
}
interface ActionTarget {
  type: 'action',
  name: ActionName,
}

// When basis >= value, reveal that resource
export interface RevealRule {
  type: 'reveal',
  target: ResourceTarget|ActionTarget
  basis: ResourceName,
  value: number,
}

interface RateRule {
  type: 'rate',
  resource: ResourceName,
  basis: ResourceName,
  value: number,
}

export interface CapacityRule {
  type: 'capacity',
  resource: ResourceName,
  basis: ResourceName,
  value: number,
}

export type Condition = ResourceCondition;

interface ResourceCondition {
  type: 'resource',
  name: ResourceName,
  operator: '==' | '<' | '>' | '<=' | '>='
  value: number,
}

export type Consequence = WinConsequence | DieConsequence | GainResourceConsequence | LoseResourceConsequence;

interface WinConsequence {
  type: 'win',
}

interface DieConsequence {
  type: 'die',
}

interface GainResourceConsequence {
  type: 'gainResource',
  name: ResourceName,
  value: number,
}

interface LoseResourceConsequence {
  type: 'loseResource',
  name: ResourceName,
  value: number,
}
