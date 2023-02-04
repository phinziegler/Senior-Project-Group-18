import { router } from "./routes";
import http from 'http';
import Coordinate from '../shared/Coordinate';
import STATIC_PATH from "./static-path"; 

/* 'require' statements are often used by Node.js applications to import modules
    this particular require statement allows us to access environment variables */
require('dotenv').config(); 

/*  Now we can use process.env.<variable-name> to read from the .env file

    Environment variables allow the app to use sensative variable data, such as database connection strings,
    without storing them directly in code (for anyone who sees the git repository to steal!).
    as such, .env files should never be committed.
*/
const ENV = process.env.NODE_ENV || 'development';  // ENV will be equal to the NODE_ENV environment variable, and 
                                                    // if it is undefined, it will default to 'development'

const express = require('express');
const app = express();

/*  
    The static path is the path to the client files.
    The ternary operator is used to change the path... this is because the app runs in a different location 
    when it has been built vs when running the typescript directly (which is the case for npm run dev)
*/
app.use(express.static(STATIC_PATH));
app.use(router);

// Another use of environment variables --> default to port 8000 if PORT has not been set
const serverPort = process.env.PORT || 8000;
const server = http.createServer(app);

// Starts the server listening for http requests
server.listen(serverPort, () => {
    console.log(`Server started on port ${serverPort} in mode ${ENV}`);
});

// this being here is super random, but I just wanted an example of using the 'shared' folder to access data types
let coord: Coordinate = {x: 1, y: 2};  

