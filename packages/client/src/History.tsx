import api from './engine/api';
import { For, createSignal } from 'solid-js';

const HISTORY_LENGTH = 15;

export default function History() {
  const [history, setHistory] = createSignal(api.history.get());
  api.history.subscribe(setHistory);

  const historyReverse = () => history().slice().reverse();

  return <div class="panel history">
    <h2>History</h2>
    <For each={historyReverse().slice(0, HISTORY_LENGTH)}>
      {(event, i) => {
        return <div style={{opacity: 1-(Math.sqrt(i()/HISTORY_LENGTH))}}>{event}</div>
      }}
    </For>
  </div>
}


