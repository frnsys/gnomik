import api from './engine/api';
import Rules from './Rules';
import Actions from './Actions';
import History from './History';
import Resources from './Resources';
import { applyRates, checkConditions } from './engine/logic';
import update from 'immutability-helper';
import EditRule from './RuleEditor';

function App() {
  setInterval(() => {
    applyRates();
    checkConditions();
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

