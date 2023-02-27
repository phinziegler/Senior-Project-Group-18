import React, { useState } from 'react';
import Other from './client/routes/Other';
import Login from './client/components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './client/routes/Root';
import ErrorPage from './client/routes/ErrorPage';
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import './client/styles/style.css';
import ClientSocketManager from './client/ClientSocketManager';
import CreateAccount from './client/components/CreateAccount';
import User from './shared/User';
import UserPage from './client/components/UserPage';

new ClientSocketManager();
export default function App(props: { user: User | null }) {
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
                        console.log("SET USER");
                        console.log(newUser);
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