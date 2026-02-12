import db from '../../database.js';

export const getUsers = async (req, res) => {
    try {
        const users = db.prepare("SELECT * FROM users").all();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Tietokantavirhe" });
    }
};

export const getUserName = async (req, res) => {
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
};

export const getUserId = async (req, res) => {
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
};

export const editUser = async (req, res) => {
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
};

export const addUser = async (req, res) => {
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
};

export const deleteUser = async (req, res) => {
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
};