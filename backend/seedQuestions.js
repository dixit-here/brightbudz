require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Question");

const questions = [
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "easy",
    content: { en: { question: "What is the degree of the polynomial 4x³ + 2x² + 7?", options: ["1", "2", "3", "7"], explanation: "The highest power of x is 3, so the degree is 3." } },
    correctAnswerIndex: 2
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "easy",
    content: { en: { question: "Which of the following is a polynomial?", options: ["1/x + 2", "√x + 1", "x² + 3x + 2", "x^(-1) + 5"], explanation: "x² + 3x + 2 has only non-negative integer powers of x." } },
    correctAnswerIndex: 2
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "easy",
    content: { en: { question: "What is the value of polynomial p(x) = x² - 3x + 2 at x = 1?", options: ["0", "1", "2", "-1"], explanation: "p(1) = 1 - 3 + 2 = 0" } },
    correctAnswerIndex: 0
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "medium",
    content: { en: { question: "If x = 2 is a zero of p(x) = x² - 5x + 6, what is the other zero?", options: ["1", "2", "3", "6"], explanation: "x² - 5x + 6 = (x-2)(x-3), so the other zero is 3." } },
    correctAnswerIndex: 2
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "medium",
    content: { en: { question: "Factorize: x² - 9", options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"], explanation: "x² - 9 is a difference of squares: (x-3)(x+3)" } },
    correctAnswerIndex: 0
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "medium",
    content: { en: { question: "What is the coefficient of x² in 3x³ - 7x² + 4x - 1?", options: ["3", "-7", "4", "-1"], explanation: "The term with x² is -7x², so the coefficient is -7." } },
    correctAnswerIndex: 1
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "medium",
    content: { en: { question: "What is the remainder when x³ + 3x² + 3x + 1 is divided by x + 1?", options: ["0", "1", "2", "-1"], explanation: "By Remainder Theorem, p(-1) = -1 + 3 - 3 + 1 = 0" } },
    correctAnswerIndex: 0
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "hard",
    content: { en: { question: "Expand: (x + 2)³", options: ["x³ + 6x² + 12x + 8", "x³ + 8", "x³ + 4x² + 4x + 8", "x³ + 2x² + 4x + 8"], explanation: "Using (a+b)³ = a³ + 3a²b + 3ab² + b³ = x³ + 6x² + 12x + 8" } },
    correctAnswerIndex: 0
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "hard",
    content: { en: { question: "If p(x) = 2x³ - 3x² + x - 1, what is p(0)?", options: ["0", "1", "-1", "2"], explanation: "p(0) = 0 - 0 + 0 - 1 = -1" } },
    correctAnswerIndex: 2
  },
  {
    grade: "9", subject: "Math", chapter: "Polynomials", difficulty: "hard",
    content: { en: { question: "Which identity is used to factorize x³ + 8?", options: ["(a+b)²", "(a-b)²", "a³ + b³ = (a+b)(a²-ab+b²)", "a³ - b³ = (a-b)(a²+ab+b²)"], explanation: "x³ + 8 = x³ + 2³ uses the sum of cubes identity: a³ + b³ = (a+b)(a²-ab+b²)" } },
    correctAnswerIndex: 2
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB ✅");

    // Remove existing questions for this chapter to avoid duplicates
    await Question.deleteMany({ grade: "9", subject: "Math", chapter: "Polynomials" });
    console.log("Cleared existing questions for Grade 9 / Math / Polynomials");

    await Question.insertMany(questions);
    console.log("✅ Questions seeded successfully!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding:", err.message);
    process.exit(1);
  }
}

seed();
