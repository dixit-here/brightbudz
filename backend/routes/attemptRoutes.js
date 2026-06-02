const express = require("express");
const router = express.Router();
const { saveAttempt } = require("../controllers/attemptController");

router.post("/save", saveAttempt);

module.exports = router;
