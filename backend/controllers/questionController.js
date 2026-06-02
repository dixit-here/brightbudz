const Question = require("../models/Question");

// Add Question
exports.addQuestion = async (req, res) => {
  try {
    const {
      grade,
      subject,
      chapter,
      difficulty,
      question,
      options,
      explanation,
      correctAnswerIndex
    } = req.body;

    const newQuestion = new Question({
      grade,
      subject,
      chapter,
      difficulty: difficulty || "medium",
      content: {
        en: {
          question,
          options,
          explanation
        }
      },
      correctAnswerIndex
    });

    await newQuestion.save();
    res.status(201).json({ message: "Question Added ✅" });

  } catch (error) {
    res.status(500).json({ error: "Failed to add question" });
  }
};


exports.getPracticeQuestions = async (req, res) => {
  try {
    const { grade, subject, chapter, language = "en" } = req.query;

    const filter = {};
    if (grade) filter.grade = grade;
    if (subject) {
      // Normalize: 'Maths' and 'Math' should both match, same for Physics/Physic etc.
      const base = subject.replace(/s$/i, '');
      filter.subject = new RegExp(`^${base}s?$`, 'i');
    }
    if (chapter) filter.chapter = chapter;

    const questions = await Question.find(filter);

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found" });
    }

    const formattedQuestions = questions.map(q => ({
      id: q._id,
      question: q.content[language]?.question,
      options: q.content[language]?.options
    }));

    res.json(formattedQuestions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Quiz Mode (Random 10)
exports.getQuizQuestions = async (req, res) => {
  try {
    const { grade, subject, chapter } = req.query;

    const total = await Question.countDocuments({
      grade,
      subject,
      chapter
    });

    const sampleSize = total >= 10 ? 10 : total;

    const questions = await Question.aggregate([
      { $match: { grade, subject, chapter } },
      { $sample: { size: sampleSize } }
    ]);

    res.json(questions);

  } catch (error) {
    res.status(500).json({ error: "Error fetching quiz questions" });
  }
};

exports.checkPracticeAnswer = async (req, res) => {
  try {
    const { questionId, selectedIndex, language = "en" } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const isCorrect = question.correctAnswerIndex === selectedIndex;

    res.json({
      isCorrect,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.content[language]?.explanation
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
