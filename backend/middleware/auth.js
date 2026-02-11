import jwt from "jsonwebtoken";

// Oikeassa sovelluksessa tekisin .env tiedosto mihin laittaisin tämä:
// JWT_SECRET = "pitkä salainen avain"
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const verifyToken = (req, res, next) => {
    // Lukee Authorization-header 
    const authHeader = req.headers["authorization"];
    // Erottaa bearer/token ja käyttää token osaa
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "käyttö estetty" })
    }
    try {
        // Tarkistaa tokenin allekirjoitus
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Tallennetaan käyttäjän tiedot 
        next(); // Kaikki ok
    } catch (err) {
        return res.status(403).json({ message: "Virheellinen tai vanhentunut token" });
    }
}

export default verifyToken;