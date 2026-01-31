import express from 'express';
import Database from 'better-sqlite3';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 3000;

app.use(Cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const db = new Database("database.db");

// Jos users table ei ole olemassa niin tekee sen
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    )
`).run();
// Jos admins table ei ole olemassa niin tekee sen
db.prepare(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    )
`).run();

// Oikeassa sovelluksessa tekisin .env tiedosto mihin laittaisin nämä:
// JWT_SECRET = "pitkä salainen avain"
// JWT_EXPIRES_IN = "1h"
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Käyttäjätunnus ja salasana ovat pakollisia" });
        }

        // Hae admin
        const admin = db
            .prepare("SELECT * FROM admins WHERE username = ?")
            .get(username);

        if (!admin) {
            return res.status(401).json({ message: "Väärä käyttäjätunnus tai salasana" });
        }

        // Tarkista salasana
        const ok = await bcrypt.compare(password, admin.password_hash);
        if (!ok) {
            return res.status(401).json({ message: "Väärä käyttäjätunnus tai salasana" });
        }

        // Luo JWT
        const token = jwt.sign(
            { sub: admin.id, role: "admin", username: admin.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({ accessToken: token });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Tietokantavirhe" });
    }
});

app.delete("/users/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Virheellinen id" });
        }

        // Tarkistaa jos käyttäjä löytyy
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

        // Tarkistaa onko käyttyäjää olemassa sähköpostin perusteella
        const existingUser = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Käyttäjä on jo olemassa",
            });
        }

        // Lisää käyttäjä
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

        // Tarkista että käyttäjä on olemassa
        const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
        if (!existing) {
            return res.status(404).json({ message: "Käyttäjää ei löytynyt" });
        }

        // Tarkista että email ei ole käytössä toisella käyttäjällä
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

        // Ottaa URL:stä stringin ja poistaa turhat välilyönnit
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

        if (!Number.isInteger(userId) || userId <= 0) {
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
