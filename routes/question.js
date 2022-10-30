const express = require("express");
const router = express.Router();
const questionController = require("../controllers/question");

router.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to stackoverflow clone api" });
});

router.post("/question", questionController.createQuestion);

router.get("/questions", questionController.getQuestion);

router.post("/comment", questionController.addComment);

module.exports = router;
