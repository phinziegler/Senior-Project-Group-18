import ReactDOM from 'react-dom/client';
import User from './shared/User';
import RouteManager from "./client/components/RouteManager";
import { tokenLogin } from './client/tools/auth';

let userGet = window.localStorage.getItem('user');
let userTemp: User | null;

// This code is yucky but it works for now
async function PreAuthenticate() {
  if (!userGet) {
    userTemp = null;
  } else {
    let storage = JSON.parse(userGet);
    userTemp = storage.user;
    if (userTemp) {
      tokenLogin().then(success => {
        if (!success) {
          window.localStorage.setItem('user', String());
          userTemp = null;
        }
      });
    }
  }
}

PreAuthenticate().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <RouteManager user={userTemp} />
  );
});