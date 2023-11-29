const { response } = require("../utils")

function checkUser(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        res.status(401).json(response("ERROR", { error: "Not logged in!" }));
    }
}

function checkDoctor(req, res, next) {
    if (!req.session.user) {
        res.status(401).json(response("ERROR", { error: "Not logged in!" }));
    }
    if (req.session.user.role === "ADMIN" || req.session.user.role === "DOCTOR") {
        next()
    } else {
        res.status(403).json(response("ERROR", { error: "Unauthorized" }));
    }
}

function checkAdmin(req, res, next) {
    if (!req.session.user) {
        res.status(401).json(response("ERROR", { error: "Not logged in!" }));
    }
    if (req.session.user.role === "ADMIN") {
        next()
    } else {
        res.status(403).json(response("ERROR", { error: "Unauthorized" }));
    }
}

module.exports = { checkUser, checkDoctor, checkAdmin };