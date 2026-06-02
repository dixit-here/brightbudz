const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema(
  {
    grade: String,
    subject: String,
    chapter: String,
    score: Number,
    total: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", AttemptSchema);
