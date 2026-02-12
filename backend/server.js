import express from 'express';
import Cors from 'cors';
import verifyToken from "./middleware/auth.js"
import routesLogin from './api/login/routesLogin.js';
import routesUsers from './api/users/routesUsers.js'

const app = express();
const PORT = 3000;

app.use(Cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/", routesLogin)

app.use(verifyToken);

app.use("/users", routesUsers)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
