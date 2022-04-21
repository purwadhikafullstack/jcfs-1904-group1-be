require("dotenv").config();
const mysql = require("mysql2");

const { DB_USER, DB_NAME, DB_PASS, DB_HOST } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
});

pool.getConnection((err, conn) => {
  if (err) {
    conn.release();
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log(`Successfully connected to the database (id ${conn.threadId})`);
  conn.release();
});

module.exports = pool;
