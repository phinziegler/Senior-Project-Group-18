import React from 'react';
import ReactDOM from 'react-dom/client';
import Other from './client/routes/Other';
import Login from './client/routes/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './client/routes/Root';
import ErrorPage from './client/routes/ErrorPage';
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import './client/styles/style.css';
import ClientSocketManager from './client/ClientSocketManager';

new ClientSocketManager();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "other",
        element: <Other />
      }, {
        path: "login",
        element: <Login />
      }
    ]
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);