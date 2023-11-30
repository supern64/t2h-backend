const express = require("express");
const bcrypt = require("bcrypt");
const { response } = require("../utils");
const { checkUser } = require("../middleware/checkUser");
const PrismaClient = require("@prisma/client").PrismaClient;

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.json());

router.get("/me", checkUser, async (req, res) => {
    const user = req.session.user;
    res.json(response("SUCCESS", { 
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname,
            gender: user.gender,
            birthday: user.birthday,
            role: user.role
        } 
    }));
});

router.get("/:id", checkUser, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.params.id
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            nickname: true,
            gender: true,
            birthday: true,
            role: true
        }
    });
    if (!user) {
        res.status(404).json(response("ERROR", { error: "User not found!" }));
        return;
    }
    res.json(response("SUCCESS", { user }));
});

router.post("/create", async (req, res) => {
    const { email, firstName, lastName, nickname, gender, password, birthday } = req.body;
    if (!email || !password) {
        res.status(400).json(response("ERROR", { error: "Missing email or password!" }));
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                email, firstName, lastName, nickname, gender, birthday: new Date(birthday), password: hashedPassword
            }
        });
        res.json(response("SUCCESS", {
            user: {
                id: user.id, firstName, lastName, nickname, gender, birthday, role: user.role
            }
        }));
    } catch (e) {
        if (e.code === "P2002") {
            res.status(400).json(response("ERROR", { error: "User with that e-mail already exists!" }));
            return;
        }
        res.status(500).json(response("ERROR", { error: "Unknown error occurred." }));
        console.log(e);
    }
});

module.exports = router;