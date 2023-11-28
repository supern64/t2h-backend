const { response } = require("../utils")

function checkUser(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        res.status(401).json(response("ERROR", { error: "Not logged in!" }));
    }
}

module.exports = checkUser;