import { rejects } from "assert";
import { Connection, MysqlError } from "mysql";

const mysql = require('mysql');
const socketPath = (process.env.SYSTEM === "windows") ? null : '/tmp/mysql.sock';

const pool = mysql.createPool({
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    socketPath: socketPath,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    connectionLimit: 10
});

/**
 * Get a connection from the connection
 * @returns a Promise which resolves to a connection object
 */
export default async function getConnection(): Promise<Connection> {
    return new Promise<Connection>((resolve, reject) => {
        pool.getConnection((error: MysqlError, connection: Connection) => {
            if(error) {
                console.log("Failed to connect");
                reject(error);
            }
            console.log('New connection, id: ' + connection.threadId);
            resolve(connection);
        });

    });
}