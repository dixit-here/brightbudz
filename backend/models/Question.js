const mongoose = require("mongoose");

const LanguageSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: v => v.length === 4
  },
  explanation: { type: String }
});

const QuestionSchema = new mongoose.Schema(
  {
    country: { type: String, default: "India" },
    board: { type: String, default: "CBSE" },

    grade: { type: String, required: true },
    subject: { type: String, required: true },
    chapter: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },

    type: {
      type: String,
      enum: ["mcq", "integer", "multi-correct"],
      default: "mcq"
    },

    tags: [String],

    isPremium: {
      type: Boolean,
      default: false
    },

    content: {
      en: { type: LanguageSchema, required: true }
    },

    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    }
  },
  { timestamps: true }
);

// Indexes for scaling
QuestionSchema.index({ grade: 1, subject: 1, chapter: 1 });
QuestionSchema.index({ difficulty: 1 });

module.exports = mongoose.model("Question", QuestionSchema);
