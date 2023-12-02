require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const MemoryStore = require("memorystore")(session);
const chatHandler = require("./socket/chat");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : "",
        credentials: true
    }
});

// middleware for everything
app.use(cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : "",
    credentials: true
}));
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000
    })
}));

// routes
app.use("/user", require("./routes/user"));
app.use("/auth", require("./routes/auth"));
app.use("/chat", require("./routes/chat"));
app.use("/assessment", require("./routes/assessment"));

// root routes
app.get("/", (req, res) => {
    res.send("T2H Backend OK!");
});

io.on("connection", (socket) => {
    console.log("User connected to chat server: " + socket.id);
    chatHandler(io, socket);
    socket.on("disconnect", () => {
        console.log("User disconnected from chat server: " + socket.id);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Started in ${process.env.NODE_ENV} mode`)
    console.log("Backend running on port: " + process.env.PORT || 3000);
})