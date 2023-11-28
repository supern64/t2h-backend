const express = require("express");
const bcrypt = require("bcrypt");
const { response } = require("../utils");
const checkUser = require("../middleware/checkUser");
const PrismaClient = require("@prisma/client").PrismaClient;

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.urlencoded({ extended: true }));

router.post("/login", async (req, res) => {
    if (req.session.user) {
        res.status(400).json(response("ERROR", { error: "Already logged in!" }));
        return;
    }
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json(response("ERROR", { error: "Missing email or password!" }));
        return;
    }
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        res.status(400).json(response("ERROR", { error: "E-mail or password incorrect!" }));
        return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        res.status(400).json(response("ERROR", { error: "E-mail or password incorrect!" }));
        return;
    }
    const userShown = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        gender: user.gender
    }
    req.session.user = user;
    res.json(response("SUCCESS", { user: userShown }));
});

router.get("/logout", checkUser, (req, res) => {
    req.session.destroy();
    res.json(response("SUCCESS", { message: "Logged out!" }));
});

module.exports = router;