import { router } from "./routes";
import http from 'http';
import STATIC_PATH from "./static-path";
import getDb from "./services/db-connect";
import Environments from "../shared/Environments";
import ServerSocketManager from "./ServerSocketManager";
const cors = require('cors');

/* 'require' statements are often used by Node.js applications to import modules
    this particular require statement allows us to access environment variables */
require('dotenv').config();

/*  Now we can use process.env.<variable-name> to read from the .env file

    Environment variables allow the app to use sensative variable data, such as database connection strings,
    without storing them directly in code (for anyone who sees the git repository to steal!).
    as such, .env files should never be committed.
*/
const ENV = process.env.NODE_ENV || Environments.DEVELOPMENT;  // ENV will be equal to the NODE_ENV environment variable, and 
                                                    // if it is undefined, it will default to 'development'

const express = require('express');
const app = express();

// The static path is the path to the client files.
app.use(cors());
app.use(express.static(STATIC_PATH));
app.use(router);

// Another use of environment variables --> default to port 8000 if PORT has not been set
const serverPort = process.env.PORT || 8000;
const server = http.createServer(app);

// Connect to the database
getDb();

// Create the websocket server/manager
const wsPort = 8080;    // NOTE: This port is only used in development
new ServerSocketManager(server, wsPort);

// Starts the server listening for http requests
server.listen(serverPort, () => {
    console.log(`Server started on port ${serverPort} in mode ${ENV}`);
});
