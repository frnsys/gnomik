import api from './engine/api';
import { numFmt } from "./format";
import { icons } from './Resources';
import { Show, For, createSignal } from "solid-js";
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
    return <div class="consequence">you gain <img src={icons[props.consq.name]} class="icon" />{numFmt(props.consq.value)} {props.consq.name}.</div>
  } else if (props.consq.type == 'loseResource') {
    return <div class="consequence">you lose <img src={icons[props.consq.name]} class="icon" />{numFmt(props.consq.value)} {props.consq.name}.</div>
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
        When you "<em>{actions[props.rule.action].name}</em>",&nbsp;<Consequence consq={props.rule.consequence} />
      </div>
    } else if (props.rule.type == 'rate') {
      return <div class="rule">
        For each of your {props.rule.basis} you gain {props.rule.value} {props.rule.resource}.
      </div>
    } else if (props.rule.type == 'capacity') {
      return <div class="rule">
        You are limited to {props.rule.value} {props.rule.resource} for each of your {props.rule.basis}.
      </div>
    } else if (props.rule.type == 'reveal') {
      return <div class="rule">
        "{props.rule.target.name}" is hidden until {props.rule.basis} reaches {props.rule.value}.
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

        let h = [...api.history.get()];
        h.push(`${api.player} changed a rule.`);
        h.push(`The gnomes are unhappy that you changed a rule.`);
        api.history.set(h);

        setEditing(false);
      }} />
    } else {
      return <div class="rule-wrapper">{displayComponent()} <div class="edit-rule-button" onClick={() => {
        if (tryPayResources({thoughts: 20})) {
          setEditing(true);
        }
      }}>Edit (20 <img src="assets/img/thought.png" class="icon" />)</div></div>
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
    <AddRule />
  </div>
}

function AddRule() {
  const [open, setOpen] = createSignal(false);
  const [rule, setRule] = createSignal<RuleType>({
    type: 'conditional',
    condition: {
      name: 'energy',
      operator: '>',
      type: 'resource',
      value: 0
    },
    consequence: {
      type: 'loseResource',
      name: 'energy',
      value: 0,
    }
  });

  return <div>
    <Show when={open()} fallback={<div class="edit-action-button edit-rule-button" onClick={() => setOpen(true)}>Add Rule</div>}>
      <EditRule rule={rule()} update={(changes) => {
        let r = update(rule(), changes);
        let rules = api.rules.get();
        api.rules.set([...rules, r]);
        let h = [...api.history.get()];
        h.push(`${api.player} added a rule.`);
        api.history.set(h);
        setOpen(false);
      }} />
    </Show>
  </div>
}
