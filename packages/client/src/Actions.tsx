import api from './engine/api';
import { numFmt } from './format';
import { ActionName } from './engine/state';
import { For, createSignal } from 'solid-js';
import { icons } from './Resources';
import { tryTakeAction } from './engine/logic';

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
          {data.requires && <div class="action-requires">Requires
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
  </div>
}

