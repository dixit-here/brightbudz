
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const {
  addQuestion,
  getPracticeQuestions,
  checkPracticeAnswer,
  getQuizQuestions,
  getAdminQuestions,
  updateQuestion,
  deleteQuestion,
  getSingleQuestion
} = require("../controllers/questionController");

// 🔐 Admin only
router.post("/add",           verifyToken, isAdmin, addQuestion);
router.get("/admin",          verifyToken, isAdmin, getAdminQuestions);
router.get("/edit/:id",       verifyToken, isAdmin, getSingleQuestion);
router.put("/:id",            verifyToken, isAdmin, updateQuestion);
router.delete("/:id",         verifyToken, isAdmin, deleteQuestion);

// 🔓 Practice Mode (No Login)
router.get("/practice",       getPracticeQuestions);
router.post("/practice/check", checkPracticeAnswer);

// 🔐 Quiz Mode (Login Required)
router.get("/quiz",           verifyToken, getQuizQuestions);

module.exports = router;
