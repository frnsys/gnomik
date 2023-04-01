import api from './engine/api';
import { numFmt } from "./format";
import { icons } from './Resources';
import { For, createSignal } from "solid-js";
import { Rule as RuleType, Condition as CondType, Consequence as ConsqType } from './engine/rules';


function Condition(props: {cond: CondType}) {
  if (props.cond.type == 'resource') {
    return <div class="condition">If <img src={icons[props.cond.name]} class="icon" />{props.cond.name} {props.cond.operator} {numFmt(props.cond.value)}, then:</div>
  }
  return <div class="condition">(unknown condition)</div>
}

function Consequence(props: {consq: ConsqType}) {
  if (props.consq.type == 'win') {
    return <div class="consequence">you win.</div>
  } else if (props.consq.type == 'die') {
    return <div class="consequence">you die.</div>
  } else if (props.consq.type == 'gainResource') {
    return <div class="consequence">you gain <img src={icons[props.consq.name]} class="icon" />{numFmt(props.consq.value)}.</div>
  } else if (props.consq.type == 'loseResource') {
    return <div class="consequence">you lose <img src={icons[props.consq.name]} class="icon" />{numFmt(props.consq.value)}.</div>
  }
  return <div class="condition">(unknown consequence)</div>
}

function EditActionRule() {
  let actions = api.actions.get();
  let resources = api.resources.get();

  return <div class="edit-rule">
    When you&nbsp;
    <select>
      <For each={Object.entries(actions)}>
        {([k, action]) => {
          return <option value={k}>{action.name}</option>
        }}
      </For>
    </select>
    <select>
      <option>you die.</option>
      <option>you win.</option>
      <For each={Object.entries(resources)}>
        {([k, _resource]) => {
          return <option value={k}>you gain {k}.</option>
        }}
      </For>
      <For each={Object.entries(resources)}>
        {([k, _resource]) => {
          return <option value={k}>you lose {k}.</option>
        }}
      </For>
    </select>
  </div>
}

function EditConditionalRule() {
  let resources = api.resources.get();

  return <div class="edit-rule">
    If &nbsp;
    <select>
      <For each={Object.entries(resources)}>
        {([k, _resource]) => {
          return <option value={k}>you gain {k}.</option>
        }}
      </For>
      <For each={Object.entries(resources)}>
        {([k, _resource]) => {
          return <option value={k}>you lose {k}.</option>
        }}
      </For>
    </select>
    <select>
      <option>&lt;</option>
      <option>&lte;</option>
      <option>==</option>
      <option>&gt;</option>
      <option>&gte;</option>
    </select>
  </div>
}

function Rule(props: {rule: RuleType}) {
  let actions = api.actions.get();

  if (props.rule.type == 'conditional') {
    return <div class="rule">
      <Condition cond={props.rule.condition} />
      <Consequence consq={props.rule.consequence} />
    </div>
  } else if (props.rule.type == 'action') {
    return <div class="rule">
      When you <em>{actions[props.rule.action].name}</em>, <Consequence consq={props.rule.consequence} />
    </div>
  }
  return <div class="rule">(unknown rule)</div>
}

export default function Rules() {
  const [rules, setRules] = createSignal(api.rules.get());
  api.rules.subscribe(setRules);

  return <div class="panel rules">
    <h2>Rules</h2>
    <For each={rules()}>
      {(rule) => <Rule rule={rule} />}
    </For>
    <EditActionRule />
    <EditConditionalRule />
  </div>
}
