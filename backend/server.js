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

app.delete("/users/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Virheellinen id" });
        }

        // tarkistaa jos käyttäjä löytyy
        const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
        if (!existing) {
            return res.status(404).json({ message: "Käyttäjää ei löytynyt" });
        }

        db.prepare("DELETE FROM users WHERE id = ?").run(id);


        return res.json({ message: "Käyttäjä poistettu" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Tietokantavirhe" });
    }
});


app.post("/users", (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Nimi ja sähköposti ovat pakollisia",
            });
        }

        // tarkistaa onko käyttyäjää olemassa sähköpostin perusteella
        const existingUser = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Käyttäjä on jo olemassa",
            });
        }

        // lisää käyttäjä
        const result = db
            .prepare("INSERT INTO users (name, email) VALUES (?, ?)")
            .run(name, email);


        const newUser = db
            .prepare("SELECT * FROM users WHERE id = ?")
            .get(result.lastInsertRowid);

        return res.status(201).json(newUser);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Tietokantavirhe",
        });
    }
});

app.put("/users/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, email } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Virheellinen id" });
        }

        if (!name || !email) {
            return res.status(400).json({ message: "Nimi ja sähköposti ovat pakollisia" });
        }

        // tarkista että käyttäjä on olemassa
        const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
        if (!existing) {
            return res.status(404).json({ message: "Käyttäjää ei löytynyt" });
        }

        // tarkista että email ei ole käytössä toisella käyttäjällä
        const existingEmail = db
            .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
            .get(email, id);

        if (existingEmail) {
            return res.status(409).json({ message: "Sähköposti on jo käytössä" });
        }

        db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, id);

        const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        return res.json(updatedUser);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Tietokantavirhe" });
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

        // ottaa URL:stä stringin ja poistaa turhat välilyönnit
        const name = String(req.query.name || "").trim();

        if (!name) {
            return res.status(400).json({ message: "nimi puuttuu" });
        }

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
        const userId = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Virheellinen id" });
        }

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
