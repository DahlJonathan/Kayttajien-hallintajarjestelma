import express from 'express';
import Database from 'better-sqlite3';


const app = express();
const PORT = 3000;

const db = new Database("database.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL

    )
`).run();



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
