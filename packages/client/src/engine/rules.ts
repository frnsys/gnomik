import { ActionName, ResourceName } from "./state";

export type Rule = ConditionalRule | ActionRule;

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

export type Condition = ResourceCondition;

interface ResourceCondition {
  type: 'resource',
  name: ResourceName,
  operator: '==' | '<' | '>' | '<=' | '>='
  value: number,
}

export type Consequence = WinConsequence | DieConsequence | GainResourceConsequence | LoseResourceConsequence | ChangeRateConsequence;

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

interface ChangeRateConsequence {
  type: 'changeRate',
  name: ResourceName,
  value: number,
}

interface RevealActionConsequence {
  type: 'revealAction',
  name: ActionName,
}

interface RevealResourceConsequence {
  type: 'revealConsequence',
  name: ActionName,
}
