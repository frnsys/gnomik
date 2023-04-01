import api from './engine/api';
import { For, createSignal } from "solid-js";
import { Condition, Consequence, Rule } from './engine/rules';
import update, { Spec } from 'immutability-helper';

interface Props {
  rule: Rule,
  update: (update: Spec<Rule>) => void,
}

export default function EditRule(props: Props) {
  // Local copy
  const [rule, setRule] = createSignal(props.rule);

  const submitChanges = () => {
    props.update({$set: rule()});
  }

  const updateConsequence = (changes: Spec<Consequence>) => {
    setRule(update(rule(), {
      consequence: {$set: update(rule().consequence, changes)}
    }));
  }

  const component = () => {
    let rule_ = rule();
    switch (rule_.type) {
      case 'conditional': {
        const updateCondition = (changes: Spec<Condition>) => {
          setRule(update(rule_, {
            condition: {$set: update((rule_ as any).condition, changes)}
          }));
        }
        return <div class="edit-rule">
          <EditCondition cond={rule_.condition} update={updateCondition} />
          &nbsp;then&nbsp;
          <EditConsequence consq={rule_.consequence} update={updateConsequence} />
        </div>
      }
      case 'action': {
        let actions = api.actions.get();
        return <div class="edit-rule">
          When you&nbsp;
          <select value={rule_.action}>
            <For each={Object.entries(actions)}>
              {([k, action]) => {
                return <option value={k}>{action.name}</option>
              }}
            </For>
          </select>
          <EditConsequence consq={rule_.consequence} update={updateConsequence} />
        </div>
      }
    }
  }

  return <div class="rule-wrapper">{component()} <div class="edit-rule-button" onClick={submitChanges}>Save</div></div>
}

function EditConsequence(props: {
  consq: Consequence,
  update: (spec: Spec<Consequence>) => void,
}) {
  const resources = api.resources.get();
  const selectValue = () => {
    if (props.consq.type == 'gainResource') {
      return `gain-${props.consq.name}`;
    } else if (props.consq.type == 'loseResource') {
      return `lose-${props.consq.name}`;
    } else if (props.consq.type == 'changeRate') {
      return `rate-${props.consq.name}`;
    } else {
      return props.consq.type;
    }
  }

  return <div>
    <select value={selectValue()} onChange={(ev) => {
      let newType = ev.currentTarget.value;
      if (newType.includes('-')) { // Hacky, but w/e
        let [changeType, resourceName] = newType.split('-');
        if (changeType == 'gain') {
          props.update({
            type: {$set: 'gainResource'},
            name: {$set: resourceName},
            value: {$set: 0},
          });
        } else if (changeType == 'rate') {
          props.update({
            type: {$set: 'changeRate'},
            name: {$set: resourceName},
            value: {$set: 0},
          });
        } else {
          props.update({
            type: {$set: 'loseResource'},
            name: {$set: resourceName},
            value: {$set: 0},
          });
        }
      } else {
        props.update({
          type: {$set: newType as any}
        })
      }
    }}>
      <option value="die">you die.</option>
      <option value="win">you win.</option>
      <For each={Object.entries(resources)}>
        {([k, _resource]) => {
          return <option value={`gain-${k}`}>you gain {k}.</option>
        }}
      </For>
      <For each={Object.entries(resources)}>
        {([k, _resource]) => {
          return <option value={`lose-${k}`}>you lose {k}.</option>
        }}
      </For>
      <For each={Object.entries(resources)}>
        {([k, _resource]) => {
          return <option value={`rate-${k}`}>change {k}'s production rate.</option>
        }}
      </For>
    </select>
    {'value' in props.consq && <input type="number" value={props.consq.value} onChange={(ev) => {
      let val = parseInt(ev.currentTarget.value);
      props.update({
        value: {$set: val},
      });
    }}/>}
  </div>
}

function EditCondition(props: {
  cond: Condition,
  update: (spec: Spec<Condition>) => void,
}) {
  const resources = api.resources.get();
  const component = () => {
    switch (props.cond.type) {
      case 'resource': {
        return <div>
          If you have &nbsp;
          <select value={props.cond.operator}>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="==">==</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
          </select>
          <input type="number" value={props.cond.value} />
          <select value={props.cond.name}>
            <For each={Object.entries(resources)}>
              {([k, _resource]) => {
                return <option value={k}>{k}</option>
              }}
            </For>
          </select>
        </div>
      }
    }
  }
  return <div>{component()}</div>
}
