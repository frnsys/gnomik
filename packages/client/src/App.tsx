import Rules from './Rules';
import Actions from './Actions';
import History from './History';
import Resources from './Resources';
import { applyRates } from './engine/logic';

function App() {
  setInterval(() => {
    applyRates();
  }, 1000);

  return <div>
    <header>
      <img src="/assets/gnome.png" /> gnomik
    </header>
    <div class="panels">
      <Resources />
      <Actions />
      <History />
    </div>
    <Rules />
  </div>
}

export default App;

