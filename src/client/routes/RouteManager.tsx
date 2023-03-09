import React, { useState } from 'react';
import AdminPage from './AdminPage';
import Login from '../components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root';
import ErrorPage from './ErrorPage';
import CreateLobby from '../components/CreateLobby';
import LobbyPage from '../components/LobbyPage';
import LobbyList from '../components/LobbyList';
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import '../../client/styles/style.css';
import ClientSocketManager from '../ClientSocketManager';
import CreateAccount from '../components/CreateAccount';
import User from '../../shared/User';
import UserPage from '../components/UserPage';

export default function RouteManager(props: { user: User | null }) {

    // used by pages with the capacity to change the user
    const setUserFunction = (data: any) => {
        if (data) {
            window.localStorage.setItem('user', JSON.stringify(data));
            setUser(data.user);
            return;
        }
        window.localStorage.setItem('user', String());
        setUser(null);
    }

    const [user, setUser] = useState<(User | null)>(props.user);
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root user={user} />,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "admin",
                    element: <AdminPage />
                }, {
                    path: "login",
                    element: <Login user={user} setUser={setUserFunction} />
                },
                {
                    path: "create-account",
                    element: <CreateAccount />
                },
                {
                    path: "user/:username",
                    element: <UserPage setUser={setUserFunction} user={user} />
                },
                {
                    path: "create-lobby",
                    element: <CreateLobby />
                },
                {
                    path: "lobby/:lobbyId",
                    element: <LobbyPage user={user}/>
                },
                {
                    path: "lobby-list",
                    element: <LobbyList/>
                },
            ]
        }
    ]);
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}