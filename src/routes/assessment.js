const express = require("express");
const { response } = require("../utils");
const { checkUser, checkDoctor } = require("../middleware/checkUser");
const { randomBytes } = require("node:crypto");
const PrismaClient = require("@prisma/client").PrismaClient;

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.json());

router.get("/user/me", checkUser, async (req, res) => {
    const assessments = await prisma.assessment.findMany({
        where: {
            user: {
                id: req.session.user.id
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    res.json(response("SUCCESS", { assessments }));
});

router.get("/user/:id", checkDoctor, async (req, res) => {
    const assessments = await prisma.assessment.findMany({
        where: {
            user: {
                id: req.params.id
            }
        },
        orderBy: {
            createdAt: "desc"
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
    res.json(response("SUCCESS", { assessments }));
})

router.post("/create", checkUser, async (req, res) => {
    const assessment = await prisma.assessment.create({
        data: {
            score: req.body.score,
            user: {
                connect: {
                    id: req.session.user.id
                }
            }
        }
    });
    res.json(response("SUCCESS", { assessment }));
})

module.exports = router;