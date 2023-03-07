import React, { useState } from 'react';
import Other from './Other';
import Login from '../components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root';
import ErrorPage from './ErrorPage';
import CreateLobby from '../components/CreateLobby';
// import LobbyPage from '../components/LobbyPage';
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import '../../client/styles/style.css';
import ClientSocketManager from '../ClientSocketManager';
import CreateAccount from '../components/CreateAccount';
import User from '../../shared/User';
import UserPage from '../components/UserPage';

new ClientSocketManager();
export default function RouteManager(props: { user: User | null }) {
    const [user, setUser] = useState<(User | null)>(props.user);
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root user={user} />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "other",
                    element: <Other />
                }, {
                    path: "login",
                    element: <Login user={user} setUser={(data: any) => {
                        if (data) {
                            window.localStorage.setItem('user', JSON.stringify(data));
                            setUser(data.user);
                        } else {
                            window.localStorage.setItem('user', String());
                            setUser(null);
                        }
                    }} />
                },
                {
                    path: "create-account",
                    element: <CreateAccount />
                },
                {
                    path: "user/:username",
                    element: <UserPage setUser={(data: any | null) => {
                        if (data) {
                            window.localStorage.setItem('user', JSON.stringify(data));
                            setUser(data.user);
                        } else {
                            window.localStorage.setItem('user', String());
                            setUser(null);
                        }
                    }} user={user} />
                },
                {
                    path:"create-lobby",
                    element: <CreateLobby />
                },
                // {
                //     path: "lobby/:lobbyID",
                //     element: <LobbyPage />
                //         /* TODO */
                // }
            ]
        }
    ]);
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}