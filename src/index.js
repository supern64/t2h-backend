require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const app = express();

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

// root routes
app.get("/", (req, res) => {
    res.send("T2H Backend OK!");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Started in ${process.env.NODE_ENV} mode`)
    console.log("Server running on port: " + process.env.PORT || 3000);
})