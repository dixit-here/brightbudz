const Attempt = require("../models/Attempt");

exports.saveAttempt = async (req, res) => {
  try {
    const { grade, subject, chapter, score, total } = req.body;

    const attempt = new Attempt({
      grade,
      subject,
      chapter,
      score,
      total
    });

    await attempt.save();

    res.status(201).json({ message: "Attempt saved" });

  } catch (error) {
    res.status(500).json({ error: "Failed to save attempt" });
  }
};
