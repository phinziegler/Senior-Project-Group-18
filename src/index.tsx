import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './client/routes/App';
import { createBrowserRouter, RouterProvider, useNavigate, } from 'react-router-dom';
import Root from './client/routes/PageRoot';
import ErrorPage from './client/routes/ErrorPage';
import 'bootstrap/dist/css/bootstrap.min.css';  // this is how bootstrap is imported
import './client/styles/style.css';


// const navigate = useNavigate();
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "other",
        element: <App />
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