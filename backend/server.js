import express from 'express';
import Database from 'better-sqlite3';
import Cors from 'cors';

const app = express();
const PORT = 3000;

app.use(Cors({ origin: "http://localhost:5173" }));
app.use(express.json());


const db = new Database("database.db");

//jos database table ei ole olemassa niin tekee sen
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    )
`).run();

app.post("/users", (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Nimi ja sähköposti ovat pakollisia"
            });
        }

        const insert = db.prepare(
            "INSERT INTO users (name, email) VALUES (?, ?)"
        );

        const result = insert.run(name, email);

        const newUser = db
            .prepare("SELECT * FROM users WHERE id = ?")
            .get(result.lastInsertRowid);

        return res.status(201).json(newUser);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Tietokantavirhe"
        });
    }
});


app.get("/users", (req, res) => {
    try {
        const users = db.prepare("SELECT * FROM users").all();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Tietokantavirhe" });
    }
});

app.get("/users/search", (req, res) => {
    try {
        const name = String(req.query.name || "").trim();

        const users = db
            .prepare("SELECT * FROM users WHERE name LIKE ?")
            .all(`%${name}%`);

        return res.json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Tietokantavirhe" });
    }
});

app.get("/users/:id", (req, res) => {
    try {
        const userId = req.params.id;

        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "Käyttäjää ei löytynyt" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Tietokantayhteydessä tapahtui virhe" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
