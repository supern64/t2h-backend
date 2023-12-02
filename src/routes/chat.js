const express = require("express");
const { response } = require("../utils");
const { checkUser } = require("../middleware/checkUser");
const { randomBytes } = require("node:crypto");
const store = require("../store")
const PrismaClient = require("@prisma/client").PrismaClient;

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.json());

router.get("/room/list", checkUser, async (req, res) => {
    try {
        const chats = await prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        id: req.session.user.id
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            },
            include: {
                users: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        nickname: true
                    }
                }
            }
        })
        res.json(response("SUCCESS", { chats }));
    } catch (e) {
        console.log(e);
        res.status(500).json(response("ERROR", { error: "Unknown error occured." }));
    }
});

router.post("/room/create/:id", checkUser, async (req, res) => {
    if (!req.params.id) {
        res.status(400).json(response("ERROR", { error: "Missing user ID!" }));
        return;
    }
    if (req.params.id === req.session.user.id) {
        res.status(400).json(response("ERROR", { error: "Cannot create chat with yourself!" }));
        return;
    }
    const user = await prisma.user.findUnique({
        where: {
            id: req.params.id
        }
    });
    if (!user) {
        res.status(404).json(response("ERROR", { error: "User not found!" }));
        return;
    }
    const room = await prisma.chat.create({
        data: {
            users: {
                connect: [
                    { id: req.session.user.id },
                    { id: req.params.id }
                ]
            }
        }
    });
    if (store.chat.sessions.find((session) => session.user.id === req.params.id)) {
        store.chat.sessions.find((session) => session.user.id === req.params.id).socket.join(room.id)
    }
    if (store.chat.sessions.find((session) => session.user.id === req.session.user.id)) {
        store.chat.sessions.find((session) => session.user.id === req.session.user.id).socket.join(room.id)
    }
    const shownRoom = {
        id: room.id,
        users: room.users
    }
    res.json(response("SUCCESS", { room: shownRoom }));
});

router.get("/room/:id/messages/get", checkUser, async (req, res) => {
    if (!req.params.id) {
        res.status(400).json(response("ERROR", { error: "Missing room ID!" }));
        return;
    }
    const room = await prisma.chat.findUnique({
        where: {
            id: req.params.id
        }
    });
    if (!room) {
        res.status(404).json(response("ERROR", { error: "Room not found!" }));
        return;
    }
    const messages = await prisma.message.findMany({
        where: {
            chatId: req.params.id
        },
        orderBy: {
            createdAt: "asc"
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    nickname: true
                }
            }
        }
    });
    res.json(response("SUCCESS", { messages }));

});

router.post("/session/connect", checkUser, async (req, res) => {
    const token = randomBytes(16);
    const session = {
        token: token.toString("hex"),
        user: req.session.user,
        expiresAt: Date.now() + 1000 * 60 * 60 * 6
    }
    store.chat.sessions.push(session);
    res.json(response("SUCCESS", { token: session.token }));
});

module.exports = router;