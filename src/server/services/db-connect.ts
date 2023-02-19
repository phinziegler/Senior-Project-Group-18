const mysql = require('mysql');
const socketPath = (process.env.SYSTEM === "windows") ? null : '/tmp/mysql.sock';

// Create database connection object
const db = mysql.createConnection({
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    socketPath: socketPath,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
});

// Attempt to connect to database
db.connect((error: Error) => {
    if (error) {
        console.error('Error connecting to MySQL database: ' + error.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + db.threadId);
});

export default function getDb() {
    return db;
}