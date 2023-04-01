import { ResourceName } from "./state";

export type Rule = ConditionalRule | ActionRule;

interface ConditionalRule {
  type: 'conditional',
  condition: Condition,
  consequence: Consequence,
}

interface ActionRule {
  type: 'action',
  action: string,
  consequence: Consequence,
}

export type Condition = ResourceCondition;

interface ResourceCondition {
  type: 'resource',
  name: string,
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
