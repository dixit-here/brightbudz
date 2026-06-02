const express = require("express");
const router = express.Router();
const { getSubjects, getChapters } = require("../controllers/subjectController");

router.get("/", getSubjects);
router.get("/chapters", getChapters);

module.exports = router;
