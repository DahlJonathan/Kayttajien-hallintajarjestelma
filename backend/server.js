import express from 'express';
import Database from 'better-sqlite3';
import Cors from 'cors';



const app = express();
const PORT = 3000;

app.use(Cors({ origin: "http://localhost:5173" }));

const db = new Database("database.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL

    )
`).run();

app.get("/users", (req, res) => {
    try {
        const users = db.prepare("SELECT * FROM users").all();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Tietokantayhteydessä tapahtui virhe");
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
