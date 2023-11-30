const store = require('../store');
const { response } = require('../utils');
const PrismaClient = require("@prisma/client").PrismaClient;

const prisma = new PrismaClient();

module.exports = (io, socket) => {
    socket.on("auth", (token, callback) => {
        if (!token) {
            callback(response("ERROR", { error: "Missing or incorrect token!" }));
            return;
        }
        const session = store.chat.sessions.find((session) => token === session.token && session.token);
        if (!session) {
            callback(response("ERROR", { error: "Missing or incorrect token!" }));
            return;
        }
        if (socket.session) {
            callback(response("ERROR", { error: "Already authenticated!" }));
            return;
        }
        if (Date.now() > session.expiresAt) {
            callback(response("ERROR", { error: "Session expired!" }));
            socket.session = null;
            store.chat.sessions = store.chat.sessions.filter((session) => session.token !== token);
            return;
        }
        socket.session = session;
        session.socket = socket;
        session.token = null;
        callback(response("SUCCESS", {}));
    });

    socket.on("message", (message, room, callback) => {
        if (!socket.session) {
            callback(response("ERROR", { error: "Not authenticated!" }));
            return;
        }
        if (!message || !room) {
            callback(response("ERROR", { error: "Missing message or room!" }));
            return;
        }
        if (Date.now() > socket.session.expiresAt) {
            callback(response("ERROR", { error: "Session expired!" }));
            // cleanup
            socket.session = null;
            store.chat.sessions = store.chat.sessions.filter((session) => session.token !== token);
            return;
        }
        prisma.chat.findUnique({
            where: {
                id: room,
                users: {
                    some: {
                        id: socket.session.user.id
                    }
                }
            },
            include: {
                users: {
                    select: {
                        id: true
                    }
                }
            }
        }).then((chatRoom) => {
            if (!chatRoom) {
                callback(response("ERROR", { error: "Room not found!" }));
                return;
            }
            prisma.chat.update({
                where: {
                    id: room
                },
                data: {
                    messages: {
                        create: {
                            text: message,
                            user: {
                                connect: {
                                    id: socket.session.user.id
                                }
                            }
                        }
                    }
                }
            }).then((chat) => {
                const messageObject = {
                    text: message,
                    user: {
                        id: socket.session.user.id,
                        nickname: socket.session.user.nickname
                    },
                }
                for (user of chatRoom.users) {
                    const userOnline = store.chat.sessions.find((session) => user.id === session.user.id);
                    if (userOnline) {
                        userOnline.socket.emit("message", messageObject, room);
                    }
                }
                callback(response("SUCCESS", {}));
            }).catch((error) => {
                console.log(error)
                callback(response("ERROR", { error: "Unknown error occured!" }));
            });
        });
    });
}