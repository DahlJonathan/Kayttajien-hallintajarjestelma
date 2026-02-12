import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../database.js';

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const login = async (req, res) => {
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
};

export default login;