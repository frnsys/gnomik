import api from './engine/api';
import { slugify } from './util';
import { numFmt } from './format';
import { Action, ActionName } from './engine/state';
import { Show, For, createSignal } from 'solid-js';
import { icons } from './Resources';
import { tryTakeAction } from './engine/logic';
import update from 'immutability-helper';

const inject = (str: string, obj: Object) => str.replace(/\${(.*?)}/g, (x,g)=> obj[g]);

export function ChooseActor(props: {
  onSelect: (actor: string) => void,
}) {
  return <div class="choose-target">
    <h2>Choose Target</h2>
    <For each={api.otherPlayers}>
      {(actor) => {
        return <div class="other-actor" onClick={() => props.onSelect(actor)}>
          <div>{actor}</div>
          <div class="other-actor-resources">{numFmt(12379)}<img src="/assets/img/mushroom.png" class="icon" /></div>
        </div>
      }}
    </For>
  </div>
}

export default function Actions() {
  const [actions, setActions] = createSignal(api.actions.get());
  api.actions.subscribe(setActions);

  const doAction = (action: ActionName, target?: string) => {
    let h = [...api.history.get()];

    if (tryTakeAction(action)) {
      let event = inject(actions()[action].desc, {
        actor: api.player,
        target
      });
      h.push(event);
      api.history.set(h);
    }
  }

  return <div class="panel actions">
    <h2>Actions</h2>
    <For each={Object.entries(actions())}>
      {([name, data]) => {
        return <div class="action" onClick={() => !data.targeted && doAction(name)}>
          <div class="action-name">{data.name}</div>
          {data.requires && Object.values(data.requires).some((v) => v > 0) && <div class="action-requires">Requires
            <For each={Object.entries(data.requires)}>
              {([name, amount]) => {
                return <div class="action-requirement">{amount} <img src={icons[name]} class="icon" /></div>
              }}
            </For>
          </div>}
          {data.targeted && <ChooseActor onSelect={(target) => doAction(name, target)} />}
        </div>
      }}
    </For>
    <AddAction />
  </div>
}


function AddAction() {
  const resources = api.resources.get();

  const [open, setOpen] = createSignal(false);
  const [action, setAction] = createSignal<Action>({
    name: 'my action',
    desc: '${actor} did a thing.',
    requires: {},
  });

  const saveAction = () => {
    let a = action();
    let id = slugify(a.name);
    let actions = api.actions.get();
    api.actions.set(update(actions, {
      [id]: {$set: a}
    }));
    let h = [...api.history.get()];
    h.push(`${api.player} added an action: "${a.name}".`);
    api.history.set(h);
    setOpen(false);
  }

  return <div class="add-action">
    <Show when={open()} fallback={<div class="edit-action-button edit-rule-button" onClick={() => setOpen(true)}>Add Action</div>}>
      <div>
        <div><input name="name" type="text" placeholder="Action name"
          value={action().name}
          onInput={(ev) => {
            setAction(update(action(), {
              name: {$set: ev.currentTarget.value},
            }));
          }}
          /></div>
        <div><input name="desc" type="text" placeholder="Action description"
          value={action().desc}
          onInput={(ev) => {
            setAction(update(action(), {
              desc: {$set: ev.currentTarget.value},
            }));
          }}/></div>
        <div class="add-action-requires">
          Requires:
          <For each={Object.keys(resources)}>
            {(k) => {
              return <div>
                <label>{k}</label>
                <input type="number"
                  value={(action().requires || {})[k] || 0}
                  onInput={(ev) => {
                    let val = parseInt(ev.currentTarget.value) || 0;
                    setAction(update(action(), {
                      requires: {
                        [k]: {$set: val}
                      }
                    }));
                  }}/>
              </div>
            }}
          </For>
        </div>
        <div class="edit-rule-button" onClick={saveAction}>Save</div>
      </div>
    </Show>
  </div>
}
