const express = require("express");
const { response } = require("../utils");
const { checkUser, checkDoctor } = require("../middleware/checkUser");
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
        },
        include: {
            answers: {
                select: {
                    question: true,
                    answer: true
                }
            }
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
            },
            answers: {
                select: {
                    question: true,
                    answer: true
                }
            }
        }
    });
    res.json(response("SUCCESS", { assessments }));
})

router.post("/create", checkUser, async (req, res) => {
    // answers object has question and answer parameters
    const assessment = await prisma.assessment.create({
        data: {
            score: req.body.score,
            answers: {
                create: req.body.answers
            },
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