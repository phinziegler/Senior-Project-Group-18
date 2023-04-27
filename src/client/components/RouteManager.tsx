import React, { useState } from 'react';
import Login from '../components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root';
import ErrorPage from './ErrorPage';
import CreateLobby from '../components/CreateLobby';
import LobbyPage from '../components/LobbyPage';
import LobbyList from '../components/LobbyList';
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import '../../client/styles/style.css';
import CreateAccount from '../components/CreateAccount';
import User from '../../shared/User';
import UserPage from '../components/UserPage';
import Lobby from '../../shared/Lobby';
import { GET } from '../tools/fetch';
import ServerRoutes from '../../shared/ServerRoutes';
import requestUrl from '../tools/requestUrl';
import GamePage from './GamePage';
import Intro from './Intro';

export default function RouteManager(props: { user: User | null, lobby: Lobby | null }) {

    async function updateLobby(username?: string) {
        console.log("update lobby");
        if(!username) {
            setLobby(null);
            return;
        }

        await GET(requestUrl(ServerRoutes.GET_LOBBY_OF_USER(username)))
        .then(res => {
          return res.json();
        })
        .then((lobby: Lobby) => {
          if (!lobby) {
            setLobby(null);
          }
          setLobby(lobby);
        })
        .catch(() => {
            setLobby(null);
        });
    }

    // used by pages with the capacity to change the user
    const setUserFunction = (data: any) => {
        if (data) {
            window.localStorage.setItem('user', JSON.stringify(data));
            setUser(data.user);
            updateLobby(data.user.username);
            return;
        }
        window.localStorage.setItem('user', String());
        setUser(null);
        updateLobby();
    }

    
    const [user, setUser] = useState<(User | null)>(props.user);
    const [lobby, setLobby] = useState<(Lobby | null)>(props.lobby);

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root lobby={lobby} user={user} />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "/",
                    element: <Intro user={user}/>
                },
                {
                    path: "login",
                    element: <Login user={user} setUser={setUserFunction} />
                },
                {
                    path: "create-account",
                    element: <CreateAccount />
                },
                {
                    path: "user/:username",
                    element: <UserPage setLobby={setLobby} setUser={setUserFunction} user={user} />
                },
                {
                    path: "create-lobby",
                    element: <CreateLobby />
                },
                {
                    path: "lobby/:lobbyId",
                    element: <LobbyPage setLobby={setLobby} user={user} />
                },
                {
                    path: "lobby-list",
                    element: <LobbyList />
                },
                {
                    path: "game",
                    element: <GamePage user={user} />
                }
            ]
        }
    ]);
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}