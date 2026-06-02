const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    iconName: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", SubjectSchema);
