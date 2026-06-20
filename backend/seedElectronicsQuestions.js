require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Question");

const questions = [
  {
    grade: "",
    subject: "Electronics",
    chapter: "AND Gate",
    difficulty: "easy",
    content: {
      en: {
        question: "Observe the circuit simulation. Under which input conditions will the output LED turn ON (state = 1) for this AND gate?",
        options: [
          "Input A = 0, Input B = 0",
          "Input A = 0, Input B = 1",
          "Input A = 1, Input B = 0",
          "Input A = 1, Input B = 1"
        ],
        explanation: "An AND gate output is 1 (ON) if and only if all of its inputs are 1. For a 2-input AND gate, both Input A and Input B must be 1."
      }
    },
    correctAnswerIndex: 3,
    circuitData: JSON.stringify({
      nodes: [
        { id: "sw1", type: "SWITCH", x: 120, y: 120, label: "Input A", state: 0 },
        { id: "sw2", type: "SWITCH", x: 120, y: 240, label: "Input B", state: 0 },
        { id: "gate1", type: "AND", x: 300, y: 180, label: "AND Gate", inputsCount: 2, state: 0 },
        { id: "led1", type: "LED", x: 480, y: 180, label: "Output LED", state: 0 }
      ],
      wires: [
        { id: "w1", fromNode: "sw1", fromPort: "OUT", toNode: "gate1", toPort: "IN_0" },
        { id: "w2", fromNode: "sw2", fromPort: "OUT", toNode: "gate1", toPort: "IN_1" },
        { id: "w3", fromNode: "gate1", fromPort: "OUT", toNode: "led1", toPort: "IN" }
      ]
    })
  },
  {
    grade: "",
    subject: "Electronics",
    chapter: "OR Gate",
    difficulty: "easy",
    content: {
      en: {
        question: "How does the output LED respond when at least one input is turned ON (state = 1) in this OR gate circuit?",
        options: [
          "It remains OFF (0)",
          "It turns ON (1)",
          "It starts blinking",
          "It burns out"
        ],
        explanation: "An OR gate output is 1 (ON) if at least one of its inputs is 1. Therefore, turning Input A, Input B, or both ON will turn the LED ON."
      }
    },
    correctAnswerIndex: 1,
    circuitData: JSON.stringify({
      nodes: [
        { id: "sw1", type: "SWITCH", x: 120, y: 120, label: "Input A", state: 0 },
        { id: "sw2", type: "SWITCH", x: 120, y: 240, label: "Input B", state: 0 },
        { id: "gate1", type: "OR", x: 300, y: 180, label: "OR Gate", inputsCount: 2, state: 0 },
        { id: "led1", type: "LED", x: 480, y: 180, label: "Output LED", state: 0 }
      ],
      wires: [
        { id: "w1", fromNode: "sw1", fromPort: "OUT", toNode: "gate1", toPort: "IN_0" },
        { id: "w2", fromNode: "sw2", fromPort: "OUT", toNode: "gate1", toPort: "IN_1" },
        { id: "w3", fromNode: "gate1", fromPort: "OUT", toNode: "led1", toPort: "IN" }
      ]
    })
  },
  {
    grade: "",
    subject: "Electronics",
    chapter: "NOT Gate",
    difficulty: "easy",
    content: {
      en: {
        question: "Toggle the switch in the simulation. What is the output of the NOT gate when the Input switch is ON (state = 1)?",
        options: [
          "Output is ON (1)",
          "Output is OFF (0)",
          "Output is High-Impedance",
          "Output is oscillating"
        ],
        explanation: "A NOT gate is an inverter. When the input is 1, the output is 0. When the input is 0, the output is 1."
      }
    },
    correctAnswerIndex: 1,
    circuitData: JSON.stringify({
      nodes: [
        { id: "sw1", type: "SWITCH", x: 120, y: 180, label: "Input A", state: 0 },
        { id: "gate1", type: "NOT", x: 300, y: 180, label: "NOT Gate", state: 1 },
        { id: "led1", type: "LED", x: 480, y: 180, label: "Output LED", state: 1 }
      ],
      wires: [
        { id: "w1", fromNode: "sw1", fromPort: "OUT", toNode: "gate1", toPort: "IN" },
        { id: "w2", fromNode: "gate1", fromPort: "OUT", toNode: "led1", toPort: "IN" }
      ]
    })
  },
  {
    grade: "",
    subject: "Electronics",
    chapter: "NAND Gate",
    difficulty: "medium",
    content: {
      en: {
        question: "A NAND gate is an AND gate followed by an inverter. For which input combination will the output LED turn OFF (state = 0)?",
        options: [
          "Input A = 0, Input B = 0",
          "Input A = 0, Input B = 1",
          "Input A = 1, Input B = 0",
          "Input A = 1, Input B = 1"
        ],
        explanation: "The output of a NAND gate is 0 only when all inputs are 1. Otherwise, the output is 1."
      }
    },
    correctAnswerIndex: 3,
    circuitData: JSON.stringify({
      nodes: [
        { id: "sw1", type: "SWITCH", x: 120, y: 120, label: "Input A", state: 0 },
        { id: "sw2", type: "SWITCH", x: 120, y: 240, label: "Input B", state: 0 },
        { id: "gate1", type: "NAND", x: 300, y: 180, label: "NAND Gate", inputsCount: 2, state: 1 },
        { id: "led1", type: "LED", x: 480, y: 180, label: "Output LED", state: 1 }
      ],
      wires: [
        { id: "w1", fromNode: "sw1", fromPort: "OUT", toNode: "gate1", toPort: "IN_0" },
        { id: "w2", fromNode: "sw2", fromPort: "OUT", toNode: "gate1", toPort: "IN_1" },
        { id: "w3", fromNode: "gate1", fromPort: "OUT", toNode: "led1", toPort: "IN" }
      ]
    })
  },
  {
    grade: "",
    subject: "Electronics",
    chapter: "NOR Gate",
    difficulty: "medium",
    content: {
      en: {
        question: "A NOR gate outputs a 1 only when all of its inputs are 0. Test this in the simulation. What happens to the LED output if Input A = 0 and Input B = 0?",
        options: [
          "LED is ON (1)",
          "LED is OFF (0)",
          "LED is flashing",
          "LED is disconnected"
        ],
        explanation: "A NOR gate stands for 'NOT OR'. Its output is 1 only when both Input A and Input B are 0."
      }
    },
    correctAnswerIndex: 0,
    circuitData: JSON.stringify({
      nodes: [
        { id: "sw1", type: "SWITCH", x: 120, y: 120, label: "Input A", state: 0 },
        { id: "sw2", type: "SWITCH", x: 120, y: 240, label: "Input B", state: 0 },
        { id: "gate1", type: "NOR", x: 300, y: 180, label: "NOR Gate", inputsCount: 2, state: 1 },
        { id: "led1", type: "LED", x: 480, y: 180, label: "Output LED", state: 1 }
      ],
      wires: [
        { id: "w1", fromNode: "sw1", fromPort: "OUT", toNode: "gate1", toPort: "IN_0" },
        { id: "w2", fromNode: "sw2", fromPort: "OUT", toNode: "gate1", toPort: "IN_1" },
        { id: "w3", fromNode: "gate1", fromPort: "OUT", toNode: "led1", toPort: "IN" }
      ]
    })
  },
  {
    grade: "",
    subject: "Electronics",
    chapter: "XOR Gate",
    difficulty: "medium",
    content: {
      en: {
        question: "An Exclusive-OR (XOR) gate detects inequalities. What is the output state when Input A = 1 and Input B = 1?",
        options: [
          "Output is 0 (OFF)",
          "Output is 1 (ON)",
          "Output is floating",
          "Output is 2"
        ],
        explanation: "An XOR gate output is 1 only when the inputs are different. Since both inputs are 1 (equal), the XOR gate output is 0."
      }
    },
    correctAnswerIndex: 0,
    circuitData: JSON.stringify({
      nodes: [
        { id: "sw1", type: "SWITCH", x: 120, y: 120, label: "Input A", state: 0 },
        { id: "sw2", type: "SWITCH", x: 120, y: 240, label: "Input B", state: 0 },
        { id: "gate1", type: "XOR", x: 300, y: 180, label: "XOR Gate", inputsCount: 2, state: 0 },
        { id: "led1", type: "LED", x: 480, y: 180, label: "Output LED", state: 0 }
      ],
      wires: [
        { id: "w1", fromNode: "sw1", fromPort: "OUT", toNode: "gate1", toPort: "IN_0" },
        { id: "w2", fromNode: "sw2", fromPort: "OUT", toNode: "gate1", toPort: "IN_1" },
        { id: "w3", fromNode: "gate1", fromPort: "OUT", toNode: "led1", toPort: "IN" }
      ]
    })
  },
  {
    grade: "",
    subject: "Electronics",
    chapter: "XNOR Gate",
    difficulty: "hard",
    content: {
      en: {
        question: "An Exclusive-NOR (XNOR) gate acts as an equivalence detector. Under which conditions will the output LED be ON (state = 1)?",
        options: [
          "When Input A and Input B are different",
          "When Input A and Input B are the same (both 0 or both 1)",
          "Only when both Input A and Input B are 1",
          "Only when both Input A and Input B are 0"
        ],
        explanation: "An XNOR gate output is 1 (ON) when both inputs are equal. This includes both inputs being 0 or both inputs being 1."
      }
    },
    correctAnswerIndex: 1,
    circuitData: JSON.stringify({
      nodes: [
        { id: "sw1", type: "SWITCH", x: 120, y: 120, label: "Input A", state: 0 },
        { id: "sw2", type: "SWITCH", x: 120, y: 240, label: "Input B", state: 0 },
        { id: "gate1", type: "XNOR", x: 300, y: 180, label: "XNOR Gate", inputsCount: 2, state: 1 },
        { id: "led1", type: "LED", x: 480, y: 180, label: "Output LED", state: 1 }
      ],
      wires: [
        { id: "w1", fromNode: "sw1", fromPort: "OUT", toNode: "gate1", toPort: "IN_0" },
        { id: "w2", fromNode: "sw2", fromPort: "OUT", toNode: "gate1", toPort: "IN_1" },
        { id: "w3", fromNode: "gate1", fromPort: "OUT", toNode: "led1", toPort: "IN" }
      ]
    })
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB ✅");

    // Remove existing Electronics questions to avoid duplicates
    await Question.deleteMany({ subject: "Electronics" });
    console.log("Cleared existing Electronics questions");

    await Question.insertMany(questions);
    console.log(`✅ ${questions.length} Electronics Questions seeded successfully!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding electronics questions:", err.message);
    process.exit(1);
  }
}

seed();
