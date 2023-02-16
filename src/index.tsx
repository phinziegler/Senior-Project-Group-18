import React from 'react';
import ReactDOM from 'react-dom/client';
import Other from './client/routes/Other';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './client/routes/Root';
import ErrorPage from './client/routes/ErrorPage';
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import './client/styles/style.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "other",
        element: <Other />
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