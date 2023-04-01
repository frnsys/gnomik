import api from './engine/api';
import { numFmt } from './format';
import { ResourceName } from './engine/state';
import { For, createSignal } from 'solid-js';

export const icons: Record<ResourceName, string> = {
  energy: "/assets/img/energy.png",
  thoughts: "/assets/img/thought.png",
  hamburgers: "/assets/img/hamburger.png",
  mushrooms: "/assets/img/mushroom.png",
}

export default function Resources() {
  const [resources, setResources] = createSignal(api.resources.get());
  api.resources.subscribe(setResources);

  return <div class="panel resources">
    <h2>Resources</h2>
    <For each={Object.entries(resources())}>
      {([name, data]) => {
        return <div class="resource">
          <div class="resource-name">
            <img src={icons[name as ResourceName]} /> {name}
          </div>
          <div class="resource-rate">
            {data.rate !== null ? `${data.rate < 0 ? "":"+"}${data.rate}/sec` : ''}
          </div>
          <div class="resource-value">{numFmt(data.value)}</div>
        </div>
      }}
    </For>
  </div>
}
