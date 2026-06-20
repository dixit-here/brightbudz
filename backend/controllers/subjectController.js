const Subject = require("../models/Subject");
const path = require("path");
const fs = require("fs");

const chaptersFilePath = path.join(__dirname, "../config/chapters.json");

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching subjects" });
  }
};

// Returns chapters for a given subject + grade from the config JSON file.
// The file is read on every request so edits take effect without a restart.
exports.getChapters = (req, res) => {
  try {
    const { subject, grade } = req.query;

    if (!subject) {
      return res.status(400).json({ error: "Subject query param is required" });
    }

    const gradeVal = grade || "";
    const raw = fs.readFileSync(chaptersFilePath, "utf-8");
    const chaptersConfig = JSON.parse(raw);

    // Case-insensitive subject lookup
    const subjectKey = Object.keys(chaptersConfig).find(
      (k) => k.toLowerCase() === subject.toLowerCase()
    );

    if (!subjectKey || !chaptersConfig[subjectKey][gradeVal]) {
      return res.json([]);
    }

    res.json(chaptersConfig[subjectKey][gradeVal]);
  } catch (error) {
    console.error("Error reading chapters config:", error.message);
    res.status(500).json({ error: "Error fetching chapters" });
  }
};
