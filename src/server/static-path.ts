import path from "path";
require('dotenv').config();

// This script simply exports a constant containing the path to the static files
const STATIC_PATH = process.env.NODE_ENV === 'production' ? path.join(__dirname, "../../client") : path.join(__dirname, "../../builds/client");
export default STATIC_PATH;