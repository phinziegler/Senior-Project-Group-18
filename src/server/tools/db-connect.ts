import { MysqlError } from "mysql";

const mysql = require('mysql');
const socketPath = (process.env.SYSTEM === "windows") ? null : '/tmp/mysql.sock';

const dbConfigs = {
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    socketPath: socketPath,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
}

let connection: any;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfigs); // Recreate connection

    // Attempt to connect to database
    connection.connect((error: MysqlError) => {
        if (error) {
            console.log("Error connecting to MySQL database:", error);
            setTimeout(handleDisconnect, 2000);         // prevent hot loop
        }
        console.log('Connected to MySQL database as id ' + connection.threadId);
    });

    // Catch errors
    connection.on('error', (error: MysqlError) => {
        console.log('Database Error:', error);
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {    // Happens due to restart or timeout
            connection.release();
            handleDisconnect();
        } else {
            throw error;
        }
    });
}

handleDisconnect();

export default function getDbConnection() {
    return connection;
}