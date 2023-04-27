import { MysqlError, Pool, PoolConnection } from "mysql";

const mysql = require('mysql');
const socketPath = (process.env.SYSTEM === "windows") ? null : '/tmp/mysql.sock';

const pool: Pool = mysql.createPool({
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    socketPath: socketPath,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    connectionLimit: 100
});

/**
 * Get a connection from the connection
 * @returns Promise<PoolConnection> containing the connection object
 */
export default async function getConnection(): Promise<PoolConnection> {
    return new Promise<any>((resolve) => {
        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if(error) {
                console.log("Failed to connect");
            }
            resolve(connection);
        });
    });
}
