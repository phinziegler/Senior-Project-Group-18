import React, { useState } from 'react';
import Other from './Other';
import Login from '../components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root';
import ErrorPage from './ErrorPage';
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
                    element: <Login user={user} setUser={(newUser: User) => {
                        if (newUser) {
                            window.localStorage.setItem('user', JSON.stringify(newUser));
                        } else {
                            window.localStorage.setItem('user', String());
                        }
                        setUser(newUser);
                    }} />
                },
                {
                    path: "create-account",
                    element: <CreateAccount />
                },
                {
                    path: "user/:username",
                    element: <UserPage setUser={(newUser: User | null) => {
                        if (newUser) {
                            window.localStorage.setItem('user', JSON.stringify(newUser));
                        } else {
                            window.localStorage.setItem('user', String());
                        }
                        setUser(newUser);
                    }} user={user} />
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