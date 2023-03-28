import ReactDOM from 'react-dom/client';
import User from './shared/User';
import RouteManager from "./client/components/RouteManager";
import { tokenLogin } from './client/tools/auth';
import Lobby from './shared/Lobby';
import ServerRoutes from './shared/ServerRoutes';
import requestUrl from './client/tools/requestUrl';
import { GET } from './client/tools/fetch';

let userGet = window.localStorage.getItem('user');
let userTemp: User | null;
let lobbyTemp: Lobby | null = null;

// This code is yucky but it works for now
// UPDATE: its getting worse. 
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

async function getLobbyForUser(username: string) {
  await GET(requestUrl(ServerRoutes.GET_LOBBY_OF_USER(username)))
    .then(res => {
      return res.json();
    })
    .then((lobby: Lobby) => {
      if (!lobby) {
        lobbyTemp = null;
        return;
      }
      lobbyTemp = lobby;
    })
    .catch(() => {
      lobbyTemp = null;
    });
}

async function start() {
  await PreAuthenticate();
  if (userTemp)
    await getLobbyForUser(userTemp.username);

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <RouteManager lobby={lobbyTemp} user={userTemp} />
  );
}

start();