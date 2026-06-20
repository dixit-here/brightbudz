require("dotenv").config();
const mongoose = require("mongoose");
const Subject = require("./models/Subject");

const subjectData = [
  {
    subjectId: 'maths',
    title: 'Maths',
    iconName: 'Calculator',
    color: '#3b82f6',
    description: 'Master numbers, equations, and logic with our comprehensive Mathematics practice modules.'
  },
  {
    subjectId: 'physics',
    title: 'Physics',
    iconName: 'Atom',
    color: '#8b5cf6',
    description: 'Explore the fundamental principles of the universe, from mechanics to quantum theory.'
  },
  {
    subjectId: 'chemistry',
    title: 'Chemistry',
    iconName: 'FlaskConical',
    color: '#f59e0b',
    description: 'Delve into the composition, structure, and properties of matter.'
  },
  {
    subjectId: 'social-science',
    title: 'Social Science',
    iconName: 'Globe',
    color: '#10b981',
    description: 'Understand human society, history, geography, and political structures.'
  },
  {
    subjectId: 'biology',
    title: 'Biology',
    iconName: 'Dna',
    color: '#f43f5e',
    description: 'Dive into the science of life, from microscopic cells to complex ecosystems.'
  },
  {
    subjectId: 'electronics',
    title: 'Electronics',
    iconName: 'Cpu',
    color: '#10b981',
    description: 'Design and simulate digital logic circuits interactively.'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB ✅");

    await Subject.deleteMany({});
    console.log("Cleared existing subjects collection");

    await Subject.insertMany(subjectData);
    console.log(`✅ ${subjectData.length} Subjects seeded successfully!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding subjects:", err.message);
    process.exit(1);
  }
}

seed();
