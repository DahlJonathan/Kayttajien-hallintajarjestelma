import express from 'express';
import * as route from './users.js';

const router = express.Router();

router.get("/", route.getUsers);
router.get("/search", route.getUserName);
router.get("/:id", route.getUserId);

router.delete("/:id", route.deleteUser);

router.post("/", route.addUser);

router.put("/:id", route.editUser);

export default router;