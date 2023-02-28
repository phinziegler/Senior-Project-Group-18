import ReactDOM from 'react-dom/client';
import User from './shared/User';
import RouteManager from "./client/routes/RouteManager";
import login from './client/auth';

let userGet = window.localStorage.getItem('user');
let userTemp: User | null;

if (!userGet) {
  userTemp = null;
} else {
  userTemp = JSON.parse(userGet);
  // login(userTemp?.username, userTemp?.password).then((user) => {
  //   if(user) {
  //     console.log("localStorage login succeeded");
  //     window.localStorage.setItem('user', JSON.stringify(user));
  //   } else {
  //     console.log("localStorage login failed");
  //     window.localStorage.setItem('user', String());
  //   }
  // });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <RouteManager user={userTemp} />
);