import api from './engine/api';
import { numFmt } from './format';
import { ResourceName } from './engine/state';
import { For, createSignal } from 'solid-js';
import { rateForResource, limitForResource, visibilityForResource } from './engine/logic';

export const icons: Record<ResourceName, string> = {
  energy: "assets/img/energy.png",
  thoughts: "assets/img/thought.png",
  hamburgers: "assets/img/hamburger.png",
  kitchens: "assets/img/hamburger.png",
  mushrooms: "assets/img/mushroom.png",
  shroomFarms: "assets/img/mushroom.png",
  shroomFarmers: "assets/img/gnome.png",
  gnomeDiscontent: "assets/img/gnome.png",
  cooks: "assets/img/gnome.png",
}

export default function Resources() {
  const [resources, setResources] = createSignal(api.resources.get());
  api.resources.subscribe(setResources);

  const visibleResources = () => Object.entries(resources())
    .filter(([name, _r]) => visibilityForResource(name));

  return <div class="panel resources">
    <h2>Resources</h2>
    <For each={visibleResources()}>
      {([name, data]) => {
        let rate = rateForResource(name);
        let limit = limitForResource(name);
        return <div class="resource">
          <div class="resource-name">
            <img src={icons[name as ResourceName]} /> {name}
          </div>
          <div class="resource-rate">
            {rate !== 0 ? `${rate < 0 ? "":"+"}${rate}/sec` : ''}
          </div>
          <div class="resource-value">{numFmt(data.value)}</div>
          {limit !== null && <div class="resource-limit">/{numFmt(limit)}</div>}
        </div>
      }}
    </For>
  </div>
}
