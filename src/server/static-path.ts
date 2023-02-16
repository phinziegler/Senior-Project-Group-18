import path from "path";
require('dotenv').config();

/*  
    The static path is the path to the client files.
    The ternary operator is used to change the path... this is because the app runs in a different location 
    when it has been built vs when running the typescript directly (which is the case for npm run dev)
*/
const STATIC_PATH = process.env.NODE_ENV === 'production' ? path.join(__dirname, "../../client") : path.join(__dirname, "../../builds/client");
export default STATIC_PATH;