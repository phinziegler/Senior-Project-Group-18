import ReactDOM from 'react-dom/client';
import User from './shared/User';
import App from "./App";

let userGet = window.localStorage.getItem('user');
let userTemp: User | null;

if (!userGet) {
  userTemp = null;
} else {
  userTemp = JSON.parse(userGet);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <App user={userTemp} />
);