
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const {
  addQuestion,
  getPracticeQuestions,
  checkPracticeAnswer,
  getQuizQuestions
} = require("../controllers/questionController");

// 🔐 Admin only
router.post("/add", verifyToken, isAdmin, addQuestion);

// 🔓 Practice Mode (No Login)
router.get("/practice", getPracticeQuestions); //http://localhost:5000/api/questions/practice?grade=9&subject=Math&chapter=Polynomials ->postman
router.post("/practice/check", checkPracticeAnswer);

// 🔐 Quiz Mode (Login Required)
router.get("/quiz", verifyToken, getQuizQuestions);

module.exports = router;
