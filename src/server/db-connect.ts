const mysql = require('mysql');

// Create database connection object
const db = mysql.createConnection({
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
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