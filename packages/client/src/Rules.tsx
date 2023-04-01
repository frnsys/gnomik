import api from './engine/api';
import { numFmt } from "./format";
import { icons } from './Resources';
import { For, createSignal } from "solid-js";
import { Rule as RuleType, Condition as CondType, Consequence as ConsqType } from './engine/rules';
import EditRule from './RuleEditor';
import update from 'immutability-helper';
import { tryPayResources } from './engine/logic';


function Condition(props: {cond: CondType}) {
  if (props.cond.type == 'resource') {
    return <div class="condition">If <img src={icons[props.cond.name]} class="icon" />{props.cond.name} {props.cond.operator} {numFmt(props.cond.value)}, then&nbsp;</div>
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
  } else if (props.consq.type == 'changeRate') {
    return <div class="consequence">your <img src={icons[props.consq.name]} class="icon" /> production rate changes by {numFmt(props.consq.value)}.</div>
  }
  return <div class="condition">(unknown consequence)</div>
}

function Rule(props: {idx: number, rule: RuleType}) {
  let actions = api.actions.get();
  let [editing, setEditing] = createSignal(false);

  const displayComponent = () => {
    if (props.rule.type == 'conditional') {
      return <div class="rule">
        <Condition cond={props.rule.condition} />
        <Consequence consq={props.rule.consequence} />
      </div>
    } else if (props.rule.type == 'action') {
      return <div class="rule">
        When you <em>{actions[props.rule.action].name}</em>,&nbsp;<Consequence consq={props.rule.consequence} />
      </div>
    }
    return <div class="rule">(unknown rule)</div>
  }

  const component = () => {
    if (editing()) {
      return <EditRule rule={props.rule} update={(changes) => {
        let rules = update(api.rules.get(), {
          [props.idx]: changes
        });
        api.rules.set(rules);
      }} />
    } else {
      return <div class="rule-wrapper">{displayComponent()} <div class="edit-rule-button" onClick={() => {
        setEditing(true);
      }}>Edit (20 <img src="/assets/img/thought.png" class="icon" />)</div></div>
    }
  }

  return <>{component()}</>
}

export default function Rules() {
  const [rules, setRules] = createSignal(api.rules.get());
  api.rules.subscribe(setRules);

  return <div class="panel rules">
    <h2>Rules</h2>
    <For each={rules()}>
      {(rule, i) => <Rule idx={i()} rule={rule} />}
    </For>
  </div>
}
