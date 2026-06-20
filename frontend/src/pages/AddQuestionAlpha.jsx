import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Trash,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Plus,
  Search,
  Save,
  Download,
  Upload,
  Eye,
  Layers,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";
import API_BASE from "../api";
import "./AddQuestionAlpha.css";

// Supported logic components in library
const COMPONENT_TYPES = {
  // Inputs
  SWITCH: { name: "Input Switch", category: "INPUTS", color: "#f59e0b", defaultLabel: "Switch", width: 80, height: 40 },
  CLOCK: { name: "Clock Pulse", category: "INPUTS", color: "#eab308", defaultLabel: "Clock", width: 80, height: 40 },
  CONST0: { name: "Constant 0", category: "INPUTS", color: "#64748b", defaultLabel: "Const 0", width: 70, height: 36 },
  CONST1: { name: "Constant 1", category: "INPUTS", color: "#22c55e", defaultLabel: "Const 1", width: 70, height: 36 },

  // Logic
  AND: { name: "AND Gate", category: "LOGIC", color: "#3b82f6", defaultLabel: "AND", width: 90, height: 60 },
  OR: { name: "OR Gate", category: "LOGIC", color: "#3b82f6", defaultLabel: "OR", width: 90, height: 60 },
  NOT: { name: "NOT Gate", category: "LOGIC", color: "#3b82f6", defaultLabel: "NOT", width: 70, height: 50 },
  XOR: { name: "XOR Gate", category: "LOGIC", color: "#3b82f6", defaultLabel: "XOR", width: 90, height: 60 },
  XNOR: { name: "XNOR Gate", category: "LOGIC", color: "#3b82f6", defaultLabel: "XNOR", width: 90, height: 60 },
  NAND: { name: "NAND Gate", category: "LOGIC", color: "#3b82f6", defaultLabel: "NAND", width: 90, height: 60 },
  NOR: { name: "NOR Gate", category: "LOGIC", color: "#3b82f6", defaultLabel: "NOR", width: 90, height: 60 },

  // Output
  LED: { name: "LED Light", category: "OUTPUT", color: "#ec4899", defaultLabel: "LED", width: 60, height: 60 },
  BULB: { name: "Light Bulb", category: "OUTPUT", color: "#ec4899", defaultLabel: "Bulb", width: 60, height: 70 },
  SEVENSEG: { name: "Seven Segment", category: "OUTPUT", color: "#d946ef", defaultLabel: "SSD", width: 80, height: 100 },

  // Memory
  SR_FF: { name: "SR Flip-Flop", category: "MEMORY", color: "#10b981", defaultLabel: "SR FF", width: 100, height: 100 },
  JK_FF: { name: "JK Flip-Flop", category: "MEMORY", color: "#10b981", defaultLabel: "JK FF", width: 100, height: 100 },
  D_FF: { name: "D Flip-Flop", category: "MEMORY", color: "#10b981", defaultLabel: "D FF", width: 100, height: 100 },

  // Arithmetic
  HALF_ADDER: { name: "Half Adder", category: "ARITHMETIC", color: "#06b6d4", defaultLabel: "Half Add", width: 90, height: 80 },
  FULL_ADDER: { name: "Full Adder", category: "ARITHMETIC", color: "#06b6d4", defaultLabel: "Full Add", width: 100, height: 100 },
  COMPARATOR: { name: "Comparator", category: "ARITHMETIC", color: "#06b6d4", defaultLabel: "Compare", width: 90, height: 90 },

  // Reusable
  ALU: { name: "4-bit ALU", category: "CUSTOM", color: "#8b5cf6", defaultLabel: "ALU", width: 120, height: 120 },
  MUX: { name: "Multiplexer", category: "CUSTOM", color: "#8b5cf6", defaultLabel: "MUX", width: 90, height: 100 },
  DEC: { name: "Decoder", category: "CUSTOM", color: "#8b5cf6", defaultLabel: "Decoder", width: 90, height: 100 }
};

const GRID_SIZE = 15;

export default function AddQuestionAlpha() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("id");
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin]);

  // Main canvas states
  const [nodes, setNodes] = useState([]);
  const [wires, setWires] = useState([]);
  
  // Selection & UI states
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [selectedWireId, setSelectedWireId] = useState(null);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapGrid, setSnapGrid] = useState(true);
  const [wireRouteType, setWireRouteType] = useState("orthogonal"); // orthogonal, bezier, straight

  // Wire drawing state
  const [drawingWire, setDrawingWire] = useState(null); // { fromNode, fromPort, currentX, currentY }

  // Sidebar controls
  const [sidebarTab, setSidebarTab] = useState("components"); // components, layers, metadata
  const [searchQuery, setSearchQuery] = useState("");
  const [accordions, setAccordions] = useState({
    INPUTS: true,
    LOGIC: true,
    OUTPUT: true,
    MEMORY: true,
    ARITHMETIC: true,
    CUSTOM: true
  });

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Simulation controls
  const [simulating, setSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1.0); // 1x, 2x
  const [clockInterval, setClockInterval] = useState(1000); // clock duration in ms
  const lastClockTick = useRef(0);

  const [subjectsList, setSubjectsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);

  // Question Metadata state
  const [meta, setMeta] = useState({
    title: "",
    questionText: "Complete the logic gate network so that the output LED glows GREEN when Input A is 1 and Input B is 0.",
    difficulty: "medium",
    marks: "5",
    grade: "",
    subject: "",
    chapter: "",
    hints: "Use an AND gate with Input A and an inverted Input B.",
    explanation: "Output is A AND (NOT B). Options represent truth table values.",
    correctAnswerIndex: 0,
    options: ["A=1, B=0", "A=0, B=0", "A=1, B=1", "A=0, B=1"]
  });

  // Load subjects
  useEffect(() => {
    fetch(`${API_BASE}/api/subjects`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSubjectsList(data); })
      .catch(() => {});
  }, []);

  // Load chapters dynamically
  useEffect(() => {
    if (!meta.subject) {
      setChaptersList([]);
      return;
    }
    fetch(`${API_BASE}/api/subjects/chapters?subject=${encodeURIComponent(meta.subject)}&grade=${meta.grade}`)
      .then(r => r.json())
      .then(data => {
        setChaptersList(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setChaptersList([]);
      });
  }, [meta.grade, meta.subject]);

  // Load existing question if editId is provided
  useEffect(() => {
    if (editId) {
      fetch(`${API_BASE}/api/questions/edit/${editId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(q => {
          setMeta({
            title: q.title || q.content?.en?.question?.substring(0, 30) || "Logic Circuit Question",
            questionText: q.content?.en?.question || "",
            difficulty: q.difficulty || "medium",
            marks: q.marks || "5",
            grade: q.grade || "",
            subject: q.subject || "",
            chapter: q.chapter || "",
            hints: q.hints || "",
            explanation: q.content?.en?.explanation || "",
            correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : 0,
            options: q.content?.en?.options || ["", "", "", ""]
          });
          if (q.circuitData) {
            try {
              const parsed = JSON.parse(q.circuitData);
              if (parsed.nodes && parsed.wires) {
                setNodes(parsed.nodes);
                setWires(parsed.wires);
              }
            } catch (e) {
              console.error("Error parsing circuitData:", e);
            }
          }
        })
        .catch(err => {
          console.error("Error loading question details:", err);
        });
    }
  }, [editId, token]);

  // Student Preview states
  const [previewMode, setPreviewMode] = useState(false);
  const [studentSelectedOption, setStudentSelectedOption] = useState(null);
  const [studentSubmitted, setStudentSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  // Copy paste clipboard
  const [clipboard, setClipboard] = useState(null);

  // References
  const canvasRef = useRef(null);
  const keyHandlerRef = useRef(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Push state to undo stack
  const saveHistoryState = (currentNodes = nodes, currentWires = wires) => {
    const serialized = JSON.stringify({ nodes: currentNodes, wires: currentWires });
    setUndoStack(prev => [...prev, serialized]);
    setRedoStack([]); // Clear redo
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, JSON.stringify({ nodes, wires })]);
    const parsed = JSON.parse(previous);
    setNodes(parsed.nodes);
    setWires(parsed.wires);
    setSelectedNodeIds([]);
    setSelectedWireId(null);
    showToastMsg("Undo ↶");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, JSON.stringify({ nodes, wires })]);
    const parsed = JSON.parse(nextState);
    setNodes(parsed.nodes);
    setWires(parsed.wires);
    setSelectedNodeIds([]);
    setSelectedWireId(null);
    showToastMsg("Redo ↷");
  };

  // Toggle simulation
  useEffect(() => {
    let timer;
    if (simulating) {
      timer = setInterval(() => {
        // Toggle clocks
        const now = Date.now();
        setNodes(prevNodes => {
          let clockToggled = false;
          let updatedNodes = prevNodes.map(node => {
            if (node.type === "CLOCK") {
              const pulseDuration = clockInterval / 2;
              const clockState = Math.floor(now / pulseDuration) % 2;
              if (node.state !== clockState) {
                clockToggled = true;
                return { ...node, state: clockState };
              }
            }
            return node;
          });
          
          if (clockToggled || true) {
            // Solve logic circuit propagate signals
            return solveLogicCircuit(updatedNodes, wires);
          }
          return prevNodes;
        });
      }, 100 / simSpeed);
    }
    return () => clearInterval(timer);
  }, [simulating, wires, clockInterval, simSpeed]);

  // Solver for digital circuit logic simulation (Iterative relaxation propagation)
  const solveLogicCircuit = (currentNodes, currentWires) => {
    let solvedNodes = currentNodes.map(n => ({ ...n, inputValues: {}, prevClockVal: n.inputValues?.CLK }));

    // Reset non-input nodes inputs
    solvedNodes.forEach(node => {
      node.inputValues = {};
    });

    // 6 relaxation cycles for propagation feedback loop
    for (let cycle = 0; cycle < 6; cycle++) {
      // Map wires outputs to inputs
      currentWires.forEach(wire => {
        const sourceNode = solvedNodes.find(n => n.id === wire.fromNode);
        const targetNode = solvedNodes.find(n => n.id === wire.toNode);
        if (sourceNode && targetNode) {
          // Determine source value based on port
          let val = 0;
          if (sourceNode.type === "HALF_ADDER" || sourceNode.type === "FULL_ADDER" || sourceNode.type === "COMPARATOR" || sourceNode.type === "SR_FF" || sourceNode.type === "JK_FF" || sourceNode.type === "D_FF") {
            // Multiple output node
            val = sourceNode.outputs?.[wire.fromPort] || 0;
          } else {
            // Standard single output node
            val = sourceNode.state || 0;
          }
          targetNode.inputValues[wire.toPort] = val;
        }
      });

      // Update gate states based on inputs
      solvedNodes = solvedNodes.map(node => {
        const getInVal = (port, fallback = 0) => (node.inputValues[port] !== undefined ? node.inputValues[port] : fallback);

        switch (node.type) {
          case "SWITCH":
          case "CLOCK":
          case "CONST0":
          case "CONST1":
            // Input sources are self-contained
            break;
          case "NOT":
            node.state = getInVal("IN") === 1 ? 0 : 1;
            break;
          case "AND": {
            const inputs = [];
            const count = node.inputsCount || 2;
            for (let i = 0; i < count; i++) inputs.push(getInVal(`IN_${i}`));
            node.state = inputs.every(v => v === 1) ? 1 : 0;
            break;
          }
          case "OR": {
            const inputs = [];
            const count = node.inputsCount || 2;
            for (let i = 0; i < count; i++) inputs.push(getInVal(`IN_${i}`));
            node.state = inputs.some(v => v === 1) ? 1 : 0;
            break;
          }
          case "NAND": {
            const inputs = [];
            const count = node.inputsCount || 2;
            for (let i = 0; i < count; i++) inputs.push(getInVal(`IN_${i}`));
            node.state = inputs.every(v => v === 1) ? 0 : 1;
            break;
          }
          case "NOR": {
            const inputs = [];
            const count = node.inputsCount || 2;
            for (let i = 0; i < count; i++) inputs.push(getInVal(`IN_${i}`));
            node.state = inputs.some(v => v === 1) ? 0 : 1;
            break;
          }
          case "XOR": {
            const inputs = [];
            const count = node.inputsCount || 2;
            for (let i = 0; i < count; i++) inputs.push(getInVal(`IN_${i}`));
            const highCount = inputs.filter(v => v === 1).length;
            node.state = highCount % 2 === 1 ? 1 : 0;
            break;
          }
          case "XNOR": {
            const inputs = [];
            const count = node.inputsCount || 2;
            for (let i = 0; i < count; i++) inputs.push(getInVal(`IN_${i}`));
            const highCount = inputs.filter(v => v === 1).length;
            node.state = highCount % 2 === 0 ? 1 : 0;
            break;
          }
          case "LED":
          case "BULB":
            node.state = getInVal("IN");
            break;
          case "SEVENSEG": {
            // Decodes 4 inputs as binary (BCD)
            const a = getInVal("IN_A");
            const b = getInVal("IN_B");
            const c = getInVal("IN_C");
            const d = getInVal("IN_D");
            const decimalVal = (a * 8) + (b * 4) + (c * 2) + d;
            node.state = decimalVal; // store as dec integer
            break;
          }
          case "HALF_ADDER": {
            const A = getInVal("A");
            const B = getInVal("B");
            node.outputs = {
              SUM: A ^ B,
              CARRY: A & B
            };
            break;
          }
          case "FULL_ADDER": {
            const A = getInVal("A");
            const B = getInVal("B");
            const CIN = getInVal("CIN");
            const SUM = A ^ B ^ CIN;
            const COUT = (A & B) | (B & CIN) | (A & CIN);
            node.outputs = { SUM, COUT };
            break;
          }
          case "COMPARATOR": {
            const A = getInVal("A");
            const B = getInVal("B");
            node.outputs = {
              LT: A < B ? 1 : 0,
              EQ: A === B ? 1 : 0,
              GT: A > B ? 1 : 0
            };
            break;
          }
          case "D_FF": {
            const clk = getInVal("CLK");
            const d = getInVal("D");
            const prevQ = node.outputs?.Q || 0;
            let Q = prevQ;
            // Rising edge detection
            if (node.prevClockVal === 0 && clk === 1) {
              Q = d;
            }
            node.outputs = { Q, QB: Q === 1 ? 0 : 1 };
            break;
          }
          case "JK_FF": {
            const clk = getInVal("CLK");
            const j = getInVal("J");
            const k = getInVal("K");
            const prevQ = node.outputs?.Q || 0;
            let Q = prevQ;
            // Rising edge
            if (node.prevClockVal === 0 && clk === 1) {
              if (j === 0 && k === 1) Q = 0;
              else if (j === 1 && k === 0) Q = 1;
              else if (j === 1 && k === 1) Q = prevQ === 1 ? 0 : 1;
            }
            node.outputs = { Q, QB: Q === 1 ? 0 : 1 };
            break;
          }
          case "SR_FF": {
            const clk = getInVal("CLK");
            const s = getInVal("S");
            const r = getInVal("R");
            const prevQ = node.outputs?.Q || 0;
            let Q = prevQ;
            // Rising edge
            if (node.prevClockVal === 0 && clk === 1) {
              if (s === 1 && r === 0) Q = 1;
              else if (s === 0 && r === 1) Q = 0;
              else if (s === 1 && r === 1) Q = 0; // Invalid condition logic
            }
            node.outputs = { Q, QB: Q === 1 ? 0 : 1 };
            break;
          }
          case "ALU": {
            const a0 = getInVal("A0");
            const a1 = getInVal("A1");
            const b0 = getInVal("B0");
            const b1 = getInVal("B1");
            const op = getInVal("OP"); // operation code 0=ADD, 1=AND
            const valA = (a1 * 2) + a0;
            const valB = (b1 * 2) + b0;
            const res = op === 0 ? (valA + valB) : (valA & valB);
            node.outputs = {
              Y0: res & 1,
              Y1: (res >> 1) & 1,
              Y2: (res >> 2) & 1
            };
            break;
          }
          case "MUX": {
            const d0 = getInVal("D0");
            const d1 = getInVal("D1");
            const sel = getInVal("SEL");
            node.state = sel === 1 ? d1 : d0;
            break;
          }
          case "DEC": {
            const a = getInVal("A");
            const b = getInVal("B");
            const binaryVal = (a * 2) + b;
            node.outputs = {
              Y0: binaryVal === 0 ? 1 : 0,
              Y1: binaryVal === 1 ? 1 : 0,
              Y2: binaryVal === 2 ? 1 : 0,
              Y3: binaryVal === 3 ? 1 : 0
            };
            break;
          }
          default:
            break;
        }
        return node;
      });
    }

    return solvedNodes;
  };

  // Run solver on updates
  useEffect(() => {
    setNodes(prev => solveLogicCircuit(prev, wires));
  }, [wires]);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      
      const isCmd = e.ctrlKey || e.metaKey;

      if (isCmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if (isCmd && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          saveHistoryState();
          setNodes(prev => prev.filter(n => !selectedNodeIds.includes(n.id)));
          setWires(prev => prev.filter(w => !selectedNodeIds.includes(w.fromNode) && !selectedNodeIds.includes(w.toNode)));
          setSelectedNodeIds([]);
          showToastMsg("Deleted components 🗑");
        } else if (selectedWireId) {
          saveHistoryState();
          setWires(prev => prev.filter(w => w.id !== selectedWireId));
          setSelectedWireId(null);
          showToastMsg("Deleted wire 🗑");
        }
      } else if (isCmd && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          saveHistoryState();
          const newNodes = [];
          const mapping = {};
          selectedNodeIds.forEach(id => {
            const target = nodes.find(n => n.id === id);
            if (target) {
              const newId = `${target.type}_${Date.now()}_${Math.floor(Math.random() * 100)}`;
              mapping[id] = newId;
              newNodes.push({
                ...target,
                id: newId,
                x: target.x + 30,
                y: target.y + 30,
                label: target.label ? `${target.label} Copy` : ""
              });
            }
          });
          setNodes(prev => [...prev, ...newNodes]);
          setSelectedNodeIds(newNodes.map(n => n.id));
          showToastMsg("Duplicated component 👥");
        }
      } else if (isCmd && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedNodeIds(nodes.map(n => n.id));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, wires, selectedNodeIds, selectedWireId, undoStack, redoStack]);

  // Click handler to create components
  const spawnComponent = (type) => {
    saveHistoryState();
    const config = COMPONENT_TYPES[type];
    const newId = `${type}_${Date.now()}`;
    const newNode = {
      id: newId,
      type,
      x: Math.round((-pan.x + 300) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((-pan.y + 150) / GRID_SIZE) * GRID_SIZE,
      label: `${config.defaultLabel} ${nodes.filter(n => n.type === type).length + 1}`,
      rotation: 0,
      inputsCount: 2,
      delay: 100,
      state: 0,
      color: config.color,
      outputs: type.includes("FF") || type === "HALF_ADDER" || type === "FULL_ADDER" || type === "COMPARATOR" || type === "ALU" || type === "DEC" ? { Q: 0, QB: 1, SUM: 0, CARRY: 0, LT: 0, EQ: 1, GT: 0, Y0: 0, Y1: 0, Y2: 0, Y3: 0 } : {}
    };

    setNodes(prev => solveLogicCircuit([...prev, newNode], wires));
    setSelectedNodeIds([newId]);
    showToastMsg(`Added ${config.name}`);
  };

  // Convert client viewport coordinates to SVG canvas space coordinates
  const getCanvasCoords = (clientX, clientY) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  };

  // Dimensions calculator for dynamic heights on gates with many inputs
  const getNodeDimensions = (node) => {
    const config = COMPONENT_TYPES[node.type] || { width: 80, height: 60 };
    const w = node.width || config.width;
    let h = node.height || config.height;

    // Dynamically scale height for multi-input logic gates
    if (["AND", "OR", "NAND", "NOR", "XOR", "XNOR"].includes(node.type)) {
      const inputs = node.inputsCount || 2;
      if (inputs > 3) {
        h = Math.max(60, inputs * 18);
      }
    }
    return { w, h };
  };

  // Port placement calculators
  const getPortPosition = (node, portName, isInput) => {
    const { w, h } = getNodeDimensions(node);

    // Relative center point coords
    let rx = w / 2;
    let ry = h / 2;

    if (isInput) {
      // Input Ports
      if (node.type === "NOT" || node.type === "LED" || node.type === "BULB") {
        rx = 0;
        ry = h / 2;
      } else if (node.type === "SEVENSEG") {
        const ports = { IN_A: 15, IN_B: 35, IN_C: 55, IN_D: 75 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else if (node.type === "HALF_ADDER" || node.type === "COMPARATOR") {
        const ports = { A: h / 3, B: (h / 3) * 2 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else if (node.type === "FULL_ADDER") {
        const ports = { A: h / 4, B: (h / 4) * 2, CIN: (h / 4) * 3 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else if (node.type === "D_FF") {
        const ports = { D: 30, CLK: 70 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else if (node.type === "JK_FF" || node.type === "SR_FF") {
        const ports = { J: 25, S: 25, CLK: 50, K: 75, R: 75 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else if (node.type === "ALU") {
        const ports = { A0: 20, A1: 40, B0: 60, B1: 80, OP: 100 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else if (node.type === "MUX") {
        const ports = { D0: 25, D1: 50, SEL: 75 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else if (node.type === "DEC") {
        const ports = { A: 35, B: 65 };
        rx = 0;
        ry = ports[portName] || h / 2;
      } else {
        // Standard AND/OR logic gate inputs (Dynamic for N inputs)
        const count = node.inputsCount || 2;
        const pinIdx = Number(portName.replace("IN_", ""));
        if (!isNaN(pinIdx)) {
          ry = (pinIdx + 1) * (h / (count + 1));
        } else {
          ry = h / 2;
        }
        rx = 0;
      }
    } else {
      // Output Ports
      if (node.type === "SR_FF" || node.type === "JK_FF" || node.type === "D_FF") {
        const ports = { Q: 25, QB: 75 };
        rx = w;
        ry = ports[portName] || h / 2;
      } else if (node.type === "HALF_ADDER" || node.type === "FULL_ADDER") {
        const ports = { SUM: h / 3, CARRY: (h / 3) * 2, COUT: (h / 3) * 2 };
        rx = w;
        ry = ports[portName] || h / 2;
      } else if (node.type === "COMPARATOR") {
        const ports = { GT: h / 4, EQ: h / 2, LT: (h / 4) * 3 };
        rx = w;
        ry = ports[portName] || h / 2;
      } else if (node.type === "ALU") {
        const ports = { Y0: 30, Y1: 60, Y2: 90 };
        rx = w;
        ry = ports[portName] || h / 2;
      } else if (node.type === "DEC") {
        const ports = { Y0: 20, Y1: 40, Y2: 60, Y3: 80 };
        rx = w;
        ry = ports[portName] || h / 2;
      } else {
        rx = w;
        ry = h / 2;
      }
    }

    // Apply rotation
    let finalX = node.x + rx;
    let finalY = node.y + ry;

    if (node.rotation === 90) {
      const dx = rx - w / 2;
      const dy = ry - h / 2;
      finalX = node.x + w / 2 - dy;
      finalY = node.y + h / 2 + dx;
    } else if (node.rotation === 180) {
      finalX = node.x + (w - rx);
      finalY = node.y + (h - ry);
    } else if (node.rotation === 270) {
      const dx = rx - w / 2;
      const dy = ry - h / 2;
      finalX = node.x + w / 2 + dy;
      finalY = node.y + h / 2 - dx;
    }

    return { x: finalX, y: finalY };
  };

  // Wire path string builders
  const getWirePath = (wire) => {
    const fromNode = nodes.find(n => n.id === wire.fromNode);
    const toNode = nodes.find(n => n.id === wire.toNode);
    if (!fromNode || !toNode) return "";

    const start = getPortPosition(fromNode, wire.fromPort, false);
    const end = getPortPosition(toNode, wire.toPort, true);

    if (wireRouteType === "straight") {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else if (wireRouteType === "bezier") {
      const controlOffset = Math.abs(end.x - start.x) / 2;
      return `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;
    } else {
      // Orthogonal (Manhattan) routing
      const midX = (start.x + end.x) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }
  };

  // Mouse canvas interaction handlers
  const handleCanvasMouseDown = (e) => {
    if (e.button === 1 || e.button === 2 || e.target.id === "canvas-grid-bg") {
      setIsPanning(true);
      setDragOffset({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    } else if (draggedNodeId) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      let newX = coords.x - dragOffset.x;
      let newY = coords.y - dragOffset.y;

      if (snapGrid) {
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
        newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
      }

      setNodes(prev =>
        prev.map(n => (n.id === draggedNodeId ? { ...n, x: newX, y: newY } : n))
      );
    } else if (drawingWire) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDrawingWire(prev => ({ ...prev, currentX: coords.x, currentY: coords.y }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggedNodeId) {
      setDraggedNodeId(null);
    }
    setDrawingWire(null);
  };

  // Toggle switch inputs manually
  const handleToggleSwitch = (nodeId) => {
    setNodes(prev =>
      solveLogicCircuit(
        prev.map(n => (n.id === nodeId ? { ...n, state: n.state === 1 ? 0 : 1 } : n)),
        wires
      )
    );
  };

  // Node Drag Start
  const handleNodeMouseDown = (nodeId, e) => {
    e.stopPropagation();
    if (previewMode && simulating) {
      // Toggle switches in preview mode
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.type === "SWITCH") {
        handleToggleSwitch(nodeId);
      }
      return;
    }

    saveHistoryState();
    setSelectedWireId(null);
    if (!selectedNodeIds.includes(nodeId)) {
      if (e.shiftKey) {
        setSelectedNodeIds(prev => [...prev, nodeId]);
      } else {
        setSelectedNodeIds([nodeId]);
      }
    }

    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDraggedNodeId(nodeId);
      setDragOffset({
        x: coords.x - node.x,
        y: coords.y - node.y
      });
    }
  };

  // Port Connection Drag Start
  const handlePortMouseDown = (nodeId, portName, isInput, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (previewMode) return; // Disable wire drawing in student mode

    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const startPos = getPortPosition(node, portName, isInput);
      setDrawingWire({
        fromNode: nodeId,
        fromPort: portName,
        isInput,
        currentX: startPos.x,
        currentY: startPos.y
      });
    }
  };

  // Port Connection Release / Wire creation
  const handlePortMouseUp = (nodeId, portName, isInput, e) => {
    e.stopPropagation();
    if (!drawingWire) return;

    // Check validity: Wires should connect outputs to inputs
    if (drawingWire.fromNode === nodeId) {
      setDrawingWire(null);
      return;
    }

    if (drawingWire.isInput === isInput) {
      showToastMsg("⚠️ Wires must connect Output to Input!");
      setDrawingWire(null);
      return;
    }

    const outNodeId = isInput ? drawingWire.fromNode : nodeId;
    const outPort = isInput ? drawingWire.fromPort : portName;
    const inNodeId = isInput ? nodeId : drawingWire.fromNode;
    const inPort = isInput ? portName : drawingWire.fromPort;

    // Verify target input doesn't already have a wire
    const existing = wires.find(w => w.toNode === inNodeId && w.toPort === inPort);
    if (existing) {
      showToastMsg("⚠️ Input pin already connected!");
      setDrawingWire(null);
      return;
    }

    saveHistoryState();
    const newWire = {
      id: `wire_${Date.now()}`,
      fromNode: outNodeId,
      fromPort: outPort,
      toNode: inNodeId,
      toPort: inPort,
      color: "",
      animated: true
    };

    setWires(prev => [...prev, newWire]);
    setDrawingWire(null);
    showToastMsg("Connected wire 🔌");
  };

  // Delete node or wire
  const handleDeleteNode = (id) => {
    saveHistoryState();
    setNodes(prev => prev.filter(n => n.id !== id));
    setWires(prev => prev.filter(w => w.fromNode !== id && w.toNode !== id));
    setSelectedNodeIds(prev => prev.filter(nid => nid !== id));
  };

  // Fit screen logic
  const handleFitScreen = () => {
    if (nodes.length === 0) {
      setPan({ x: 20, y: 20 });
      setZoom(1.0);
      return;
    }
    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    setPan({
      x: -minX + 80,
      y: -minY + 80
    });
    setZoom(1.0);
  };

  // Export JSON
  const handleExportJSON = () => {
    const payload = {
      nodes,
      wires,
      meta
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${meta.title || "logic_question"}.json`;
    link.click();
    showToastMsg("Exported JSON 📥");
  };

  // Import JSON
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.nodes && parsed.wires) {
          saveHistoryState();
          setNodes(parsed.nodes);
          setWires(parsed.wires);
          if (parsed.meta) {
            setMeta(prev => ({ ...prev, ...parsed.meta }));
          }
          showToastMsg("Imported Question JSON 📤");
        }
      } catch (err) {
        showToastMsg("Error: Invalid JSON Format!");
      }
    };
    reader.readAsText(file);
  };

  // Save/Publish to backend database
  const handleSaveToDatabase = async () => {
    if (!meta.title.trim()) {
      showToastMsg("⚠️ Question Title is required to save!");
      setSidebarTab("metadata");
      return;
    }

    const payload = {
      grade: meta.grade,
      subject: meta.subject,
      chapter: meta.chapter,
      difficulty: meta.difficulty,
      question: meta.questionText,
      options: meta.options,
      correctAnswerIndex: Number(meta.correctAnswerIndex),
      explanation: meta.explanation,
      circuitData: JSON.stringify({ nodes, wires }) // Save circuit geometry & logic
    };

    try {
      const url = editId
        ? `${API_BASE}/api/questions/${editId}`
        : `${API_BASE}/api/questions/add`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToastMsg(editId ? "Question Updated successfully in DB ✅" : "Question Saved successfully to DB ✅");
      } else {
        const data = await res.json();
        showToastMsg(`Failed to save: ${data.message || data.error}`);
      }
    } catch (err) {
      showToastMsg("Server Error: Failed to publish!");
    }
  };

  // Calculate nodes & wires lists
  const filteredComponentTypes = useMemo(() => {
    const list = {};
    Object.keys(COMPONENT_TYPES).forEach(key => {
      const item = COMPONENT_TYPES[key];
      if (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase())) {
        list[key] = item;
      }
    });
    return list;
  }, [searchQuery]);

  // Selected item references for Properties Panel
  const selectedNode = nodes.find(n => n.id === selectedNodeIds[0]);
  const selectedWire = wires.find(w => w.id === selectedWireId);

  // Update selected node values
  const updateSelectedNodeProperty = (field, val) => {
    if (!selectedNode) return;
    setNodes(prev =>
      prev.map(n => (n.id === selectedNode.id ? { ...n, [field]: val } : n))
    );
  };

  // Node rendering helper
  const renderNodeSvg = (node) => {
    const { w, h } = getNodeDimensions(node);
    const config = COMPONENT_TYPES[node.type] || { width: 80, height: 60 };
    const isSelected = selectedNodeIds.includes(node.id);
    const color = node.color || config.color;

    // Port definition builders
    const inputs = [];
    const outputs = [];

    if (node.type === "NOT" || node.type === "LED" || node.type === "BULB") {
      inputs.push("IN");
    } else if (node.type === "SEVENSEG") {
      inputs.push("IN_A", "IN_B", "IN_C", "IN_D");
    } else if (node.type === "HALF_ADDER" || node.type === "COMPARATOR") {
      inputs.push("A", "B");
    } else if (node.type === "FULL_ADDER") {
      inputs.push("A", "B", "CIN");
    } else if (node.type === "D_FF") {
      inputs.push("D", "CLK");
    } else if (node.type === "JK_FF" || node.type === "SR_FF") {
      inputs.push("J", "S", "CLK", "K", "R");
    } else if (node.type === "ALU") {
      inputs.push("A0", "A1", "B0", "B1", "OP");
    } else if (node.type === "MUX") {
      inputs.push("D0", "D1", "SEL");
    } else if (node.type === "DEC") {
      inputs.push("A", "B");
    } else if (node.type !== "SWITCH" && node.type !== "CLOCK" && node.type !== "CONST0" && node.type !== "CONST1") {
      // Logic gates
      const count = node.inputsCount || 2;
      for (let i = 0; i < count; i++) inputs.push(`IN_${i}`);
    }

    if (node.type === "SR_FF" || node.type === "JK_FF" || node.type === "D_FF") {
      outputs.push("Q", "QB");
    } else if (node.type === "HALF_ADDER" || node.type === "FULL_ADDER") {
      outputs.push("SUM", "CARRY");
    } else if (node.type === "COMPARATOR") {
      outputs.push("GT", "EQ", "LT");
    } else if (node.type === "ALU") {
      outputs.push("Y0", "Y1", "Y2");
    } else if (node.type === "DEC") {
      outputs.push("Y0", "Y1", "Y2", "Y3");
    } else if (node.type !== "LED" && node.type !== "BULB" && node.type !== "SEVENSEG") {
      outputs.push("OUT");
    }

    // Seven segment representation
    const renderSevenSegGlow = () => {
      const val = node.state || 0;
      // segment maps for 0-9, A-F
      const segs = {
        0: [1,1,1,1,1,1,0],
        1: [0,1,1,0,0,0,0],
        2: [1,1,0,1,1,0,1],
        3: [1,1,1,1,0,0,1],
        4: [0,1,1,0,0,1,1],
        5: [1,0,1,1,0,1,1],
        6: [1,0,1,1,1,1,1],
        7: [1,1,1,0,0,0,0],
        8: [1,1,1,1,1,1,1],
        9: [1,1,1,1,0,1,1],
        10: [1,1,1,0,1,1,1], // A
        11: [0,0,1,1,1,1,1], // B
        12: [1,0,0,1,1,1,0], // C
        13: [0,1,1,1,1,0,1], // D
        14: [1,0,0,1,1,1,1], // E
        15: [1,0,0,0,1,1,1]  // F
      };
      const active = segs[val] || [0,0,0,0,0,0,0];

      // Segment coords (A, B, C, D, E, F, G)
      return (
        <g transform="translate(25, 20)">
          {/* Top (A) */}
          <rect x="5" y="0" width="20" height="4" rx="2" fill={active[0] ? "#f43f5e" : "#334155"} filter={active[0] ? "drop-shadow(0 0 2px #f43f5e)" : ""} />
          {/* Top-Right (B) */}
          <rect x="23" y="3" width="4" height="20" rx="2" fill={active[1] ? "#f43f5e" : "#334155"} filter={active[1] ? "drop-shadow(0 0 2px #f43f5e)" : ""} />
          {/* Bottom-Right (C) */}
          <rect x="23" y="25" width="4" height="20" rx="2" fill={active[2] ? "#f43f5e" : "#334155"} filter={active[2] ? "drop-shadow(0 0 2px #f43f5e)" : ""} />
          {/* Bottom (D) */}
          <rect x="5" y="44" width="20" height="4" rx="2" fill={active[3] ? "#f43f5e" : "#334155"} filter={active[3] ? "drop-shadow(0 0 2px #f43f5e)" : ""} />
          {/* Bottom-Left (E) */}
          <rect x="2" y="25" width="4" height="20" rx="2" fill={active[4] ? "#f43f5e" : "#334155"} filter={active[4] ? "drop-shadow(0 0 2px #f43f5e)" : ""} />
          {/* Top-Left (F) */}
          <rect x="2" y="3" width="4" height="20" rx="2" fill={active[5] ? "#f43f5e" : "#334155"} filter={active[5] ? "drop-shadow(0 0 2px #f43f5e)" : ""} />
          {/* Middle (G) */}
          <rect x="5" y="22" width="20" height="4" rx="2" fill={active[6] ? "#f43f5e" : "#334155"} filter={active[6] ? "drop-shadow(0 0 2px #f43f5e)" : ""} />
        </g>
      );
    };

    return (
      <g
        key={node.id}
        className={`alpha-node ${isSelected ? "selected" : ""}`}
        transform={`translate(${node.x}, ${node.y}) rotate(${node.rotation}, ${w / 2}, ${h / 2})`}
        onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
      >
        {/* Main box shape */}
        {(() => {
          const fill = "#1e293b";
          const stroke = "#334155";
          const strokeWidth = "1";
          switch (node.type) {
            case "AND":
              return (
                <>
                  <path className="alpha-node-bg" d={`M 0 0 L ${w/2} 0 A ${w/2} ${h/2} 0 0 1 ${w/2} ${h} L 0 ${h} Z`} />
                  <rect width="5" height={h} fill={color} rx="2" />
                </>
              );
            case "NAND":
              return (
                <>
                  <path className="alpha-node-bg" d={`M 0 0 L ${(w - 8)/2} 0 A ${(w - 8)/2} ${h/2} 0 0 1 ${(w - 8)/2} ${h} L 0 ${h} Z`} />
                  <circle className="alpha-node-bg" cx={w - 4} cy={h/2} r="4" />
                  <rect width="5" height={h} fill={color} rx="2" />
                </>
              );
            case "OR":
              return (
                <>
                  <path className="alpha-node-bg" d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.6} ${h} ${w} ${h/2} Q ${w*0.6} 0 0 0 Z`} />
                  <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h}`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                </>
              );
            case "NOR":
              return (
                <>
                  <path className="alpha-node-bg" d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.55} ${h} ${w - 8} ${h/2} Q ${w*0.55} 0 0 0 Z`} />
                  <circle className="alpha-node-bg" cx={w - 4} cy={h/2} r="4" />
                  <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h}`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                </>
              );
            case "XOR":
              return (
                <>
                  <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} className="alpha-node-bg" />
                  <path className="alpha-node-bg" d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.6} ${h} ${w} ${h/2} Q ${w*0.6} 0 0 0 Z`} />
                  <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                </>
              );
            case "XNOR":
              return (
                <>
                  <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} className="alpha-node-bg" />
                  <path className="alpha-node-bg" d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.55} ${h} ${w - 8} ${h/2} Q ${w*0.55} 0 0 0 Z`} />
                  <circle className="alpha-node-bg" cx={w - 4} cy={h/2} r="4" />
                  <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                </>
              );
            case "NOT":
              return (
                <>
                  <path className="alpha-node-bg" d={`M 0 0 L ${w - 8} ${h/2} L 0 ${h} Z`} />
                  <circle className="alpha-node-bg" cx={w - 4} cy={h/2} r="4" />
                  <rect width="5" height={h} fill={color} rx="2" />
                </>
              );
            default:
              return (
                <>
                  <rect
                    className="alpha-node-bg"
                    width={w}
                    height={h}
                    rx={node.type.includes("FF") || node.type === "ALU" ? 10 : 6}
                    style={{ borderLeftColor: color }}
                  />
                  <rect width="5" height={h} fill={color} rx="2" />
                </>
              );
          }
        })()}

        {/* Labels & Texts inside Component */}
        <text
          x={12}
          y={18}
          fontSize="9"
          fontWeight="bold"
          fill="#94a3b8"
          textAnchor="start"
        >
          {node.type}
        </text>

        <text
          x={w / 2}
          y={node.type === "SEVENSEG" || node.type === "BULB" || node.type === "LED" ? h - 8 : h / 2 + 4}
          fontSize="11"
          fontWeight="600"
          fill="#f8fafc"
          textAnchor="middle"
        >
          {node.label || config.defaultLabel}
        </text>

        {/* Specialized Renders */}
        {node.type === "SWITCH" && (
          <g
            transform="translate(25, 20)"
            className="sim-interactive"
            onClick={() => handleToggleSwitch(node.id)}
          >
            <rect width="30" height="14" rx="7" fill={node.state === 1 ? "#10b981" : "#334155"} />
            <circle cx={node.state === 1 ? 23 : 7} cy="7" r="5" fill="white" style={{ transition: "all 0.15s ease" }} />
          </g>
        )}

        {node.type === "CLOCK" && (
          <path
            d={node.state === 1 ? "M 25 15 L 35 15 L 35 25 L 45 25" : "M 25 25 L 35 25 L 35 15 L 45 15"}
            fill="none"
            stroke="#eab308"
            strokeWidth="2"
            transform="translate(5, 5)"
          />
        )}

        {node.type === "LED" && (
          <circle
            cx={w / 2}
            cy={h / 2 - 4}
            r="16"
            fill={node.state === 1 ? "#10b981" : "#1e293b"}
            stroke={node.state === 1 ? "#34d399" : "#475569"}
            strokeWidth="2"
            style={{ filter: node.state === 1 ? "drop-shadow(0 0 6px #10b981)" : "" }}
          />
        )}

        {node.type === "BULB" && (
          <path
            d="M 30,12 C 23,12 18,17 18,24 C 18,29 21,33 24,36 L 24,42 L 36,42 L 36,36 C 39,33 42,29 42,24 C 42,17 37,12 30,12 Z"
            fill={node.state === 1 ? "#fbbf24" : "#1e293b"}
            stroke={node.state === 1 ? "#f59e0b" : "#475569"}
            strokeWidth="2"
            style={{ filter: node.state === 1 ? "drop-shadow(0 0 8px #fbbf24)" : "" }}
          />
        )}

        {node.type === "SEVENSEG" && renderSevenSegGlow()}

        {/* Input Pin Ports */}
        {inputs.map((port) => {
          const pos = getPortPosition(node, port, true);
          // Local coords
          const lx = pos.x - node.x;
          const ly = pos.y - node.y;
          const isHigh = node.inputValues?.[port] === 1;

          return (
            <g key={port}>
              <circle
                className="alpha-port"
                cx={lx}
                cy={ly}
                r="4.5"
                fill={isHigh ? "#10b981" : "#475569"}
                stroke="#0f172a"
                strokeWidth="1"
                onMouseDown={(e) => handlePortMouseDown(node.id, port, true, e)}
                onMouseUp={(e) => handlePortMouseUp(node.id, port, true, e)}
              />
              <text x={lx + 7} y={ly + 3} fontSize="7" fill="#64748b" fontWeight="600">{port}</text>
            </g>
          );
        })}

        {/* Output Pin Ports */}
        {outputs.map((port) => {
          const pos = getPortPosition(node, port, false);
          const lx = pos.x - node.x;
          const ly = pos.y - node.y;
          const isHigh = (node.type.includes("FF") || node.type === "HALF_ADDER" || node.type === "FULL_ADDER" || node.type === "COMPARATOR" || node.type === "ALU" || node.type === "DEC" ? node.outputs?.[port] : node.state) === 1;

          return (
            <g key={port}>
              <circle
                className="alpha-port"
                cx={lx}
                cy={ly}
                r="4.5"
                fill={isHigh ? "#10b981" : "#475569"}
                stroke="#0f172a"
                strokeWidth="1"
                onMouseDown={(e) => handlePortMouseDown(node.id, port, false, e)}
                onMouseUp={(e) => handlePortMouseUp(node.id, port, false, e)}
              />
              <text x={lx - 7} y={ly + 3} fontSize="7" fill="#64748b" fontWeight="600" textAnchor="end">{port}</text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="alpha-editor-container">
      {/* Toast Message Notification */}
      {toast && <div className="alpha-toast">{toast}</div>}

      {/* ===================== SIDEBAR ===================== */}
      {!previewMode && (
        <aside className="alpha-sidebar">
          {/* Sidebar Tab headers */}
          <div className="alpha-sidebar-tabs">
            <div
              className={`alpha-sidebar-tab ${sidebarTab === "components" ? "active" : ""}`}
              onClick={() => setSidebarTab("components")}
            >
              Components
            </div>
            <div
              className={`alpha-sidebar-tab ${sidebarTab === "layers" ? "active" : ""}`}
              onClick={() => setSidebarTab("layers")}
            >
              Layers
            </div>
            <div
              className={`alpha-sidebar-tab ${sidebarTab === "metadata" ? "active" : ""}`}
              onClick={() => setSidebarTab("metadata")}
            >
              Metadata
            </div>
          </div>

          {/* TAB CONTENT: COMPONENTS */}
          {sidebarTab === "components" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div className="alpha-search-wrapper">
                <input
                  type="text"
                  className="alpha-search-input"
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="alpha-scrollable" style={{ flex: 1, overflowY: "auto" }}>
                {/* Categorized Lists */}
                {["INPUTS", "LOGIC", "OUTPUT", "MEMORY", "ARITHMETIC", "CUSTOM"].map(cat => {
                  const items = Object.keys(filteredComponentTypes).filter(k => filteredComponentTypes[k].category === cat);
                  if (items.length === 0) return null;

                  return (
                    <div key={cat} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div
                        className="alpha-accordion-header"
                        onClick={() => setAccordions(prev => ({ ...prev, [cat]: !prev[cat] }))}
                      >
                        <span>{cat}</span>
                        {accordions[cat] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </div>

                      {accordions[cat] && (
                        <div className="alpha-drag-grid">
                          {items.map(type => {
                            const config = COMPONENT_TYPES[type];
                            return (
                              <div
                                key={type}
                                className="alpha-drag-item"
                                onClick={() => spawnComponent(type)}
                                title={`Click to spawn ${config.name} on canvas`}
                              >
                                <Plus size={16} />
                                <span>{config.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT: LAYERS */}
          {sidebarTab === "layers" && (
            <div className="alpha-scrollable" style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", margin: "10px 0 10px 6px" }}>Components</h4>
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`alpha-layer-item ${selectedNodeIds.includes(node.id) ? "active" : ""}`}
                  onClick={() => {
                    setSelectedNodeIds([node.id]);
                    setSelectedWireId(null);
                  }}
                >
                  <span>🤖 {node.label || node.id}</span>
                  <Trash
                    size={12}
                    className="sim-interactive"
                    style={{ color: "#ef4444" }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                  />
                </div>
              ))}

              <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", margin: "20px 0 10px 6px" }}>Wires</h4>
              {wires.map(wire => (
                <div
                  key={wire.id}
                  className={`alpha-layer-item ${selectedWireId === wire.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedWireId(wire.id);
                    setSelectedNodeIds([]);
                  }}
                >
                  <span>🔌 {wire.fromNode}.{wire.fromPort} → {wire.toNode}.{wire.toPort}</span>
                  <Trash
                    size={12}
                    className="sim-interactive"
                    style={{ color: "#ef4444" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveHistoryState();
                      setWires(prev => prev.filter(w => w.id !== wire.id));
                      setSelectedWireId(null);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: METADATA */}
          {sidebarTab === "metadata" && (
            <div className="alpha-scrollable" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Question Title *</label>
                <input
                  type="text"
                  className="alpha-property-input"
                  placeholder="e.g. AND Logic Circuit Design"
                  value={meta.title}
                  onChange={(e) => setMeta(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Grade</label>
                <select
                  className="alpha-property-input"
                  value={meta.grade}
                  onChange={(e) => setMeta(prev => ({ ...prev, grade: e.target.value, chapter: "" }))}
                >
                  <option value="">None (No Class)</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Grade {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Subject</label>
                <select
                  className="alpha-property-input"
                  value={meta.subject}
                  onChange={(e) => setMeta(prev => ({ ...prev, subject: e.target.value, chapter: "" }))}
                >
                  <option value="">Select Subject</option>
                  {subjectsList.map(sub => (
                    <option key={sub.subjectId} value={sub.title}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Chapter</label>
                <select
                  className="alpha-property-input"
                  value={meta.chapter}
                  onChange={(e) => setMeta(prev => ({ ...prev, chapter: e.target.value }))}
                  disabled={!meta.subject}
                >
                  <option value="">Select Chapter</option>
                  {chaptersList.map((ch, idx) => (
                    <option key={idx} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Difficulty</label>
                <select
                  className="alpha-property-input"
                  value={meta.difficulty}
                  onChange={(e) => setMeta(prev => ({ ...prev, difficulty: e.target.value }))}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Question Text</label>
                <textarea
                  className="alpha-property-input"
                  rows={4}
                  value={meta.questionText}
                  onChange={(e) => setMeta(prev => ({ ...prev, questionText: e.target.value }))}
                />
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Options (MCQ)</label>
                {meta.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    className="alpha-property-input"
                    style={{ marginBottom: "6px" }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...meta.options];
                      updated[i] = e.target.value;
                      setMeta(prev => ({ ...prev, options: updated }));
                    }}
                  />
                ))}
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Correct Answer Index</label>
                <select
                  className="alpha-property-input"
                  value={meta.correctAnswerIndex}
                  onChange={(e) => setMeta(prev => ({ ...prev, correctAnswerIndex: Number(e.target.value) }))}
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div className="alpha-field-col" style={{ marginBottom: "16px" }}>
                <label className="alpha-field-label">Explanation</label>
                <textarea
                  className="alpha-property-input"
                  rows={3}
                  value={meta.explanation}
                  onChange={(e) => setMeta(prev => ({ ...prev, explanation: e.target.value }))}
                />
              </div>
            </div>
          )}
        </aside>
      )}

      {/* ===================== CANVAS & VIEWPORT ===================== */}
      <main
        className="alpha-canvas-wrapper"
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        {/* STUDENT PREVIEW INTERFACE OVERLAY */}
        {previewMode ? (
          <div className="student-preview-pane">
            <div className="student-question-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "700", textTransform: "uppercase" }}>
                  Student View
                </span>
                <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "10px", color: "#94a3b8" }}>
                  {meta.difficulty.toUpperCase()}
                </span>
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px", color: "white" }}>
                {meta.title || "Logic circuit challenge"}
              </h2>
              <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#cbd5e1", marginBottom: "20px" }}>
                {meta.questionText}
              </p>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px", fontSize: "12px", fontWeight: "600", color: "#f59e0b" }}>
                  <Info size={14} />
                  <span>Interactive Simulator</span>
                </div>
                <p style={{ fontSize: "11px", color: "#94a3b8" }}>
                  You can click and toggle switches on the canvas to test signal paths!
                </p>
              </div>

              <div style={{ flex: 1 }}>
                <label className="alpha-field-label" style={{ marginBottom: "10px" }}>Select Correct Answer:</label>
                {meta.options.map((opt, idx) => {
                  let classes = "student-option-btn";
                  if (studentSelectedOption === idx) classes += " selected";
                  if (studentSubmitted) {
                    if (idx === meta.correctAnswerIndex) classes += " correct";
                    else if (studentSelectedOption === idx) classes += " wrong";
                  }
                  return (
                    <button
                      key={idx}
                      className={classes}
                      disabled={studentSubmitted}
                      onClick={() => setStudentSelectedOption(idx)}
                    >
                      <span style={{ fontWeight: "700", marginRight: "8px" }}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {studentSubmitted && (
                <div style={{ padding: "12px", borderRadius: "8px", background: studentSelectedOption === meta.correctAnswerIndex ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${studentSelectedOption === meta.correctAnswerIndex ? "#10b981" : "#ef4444"}`, marginBottom: "16px", fontSize: "12px" }}>
                  <p style={{ fontWeight: "700", color: studentSelectedOption === meta.correctAnswerIndex ? "#10b981" : "#ef4444", marginBottom: "4px" }}>
                    {studentSelectedOption === meta.correctAnswerIndex ? "🎉 Correct Answer!" : "❌ Incorrect Answer"}
                  </p>
                  <p style={{ color: "#cbd5e1" }}>{meta.explanation}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                {!studentSubmitted ? (
                  <button
                    className="alpha-action-btn primary"
                    style={{ flex: 1, height: "42px", justifyContent: "center", borderRadius: "8px" }}
                    onClick={() => {
                      if (studentSelectedOption === null) {
                        showToastMsg("Please select an option first!");
                        return;
                      }
                      setStudentSubmitted(true);
                    }}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    className="alpha-action-btn secondary"
                    style={{ flex: 1, height: "42px", justifyContent: "center", borderRadius: "8px" }}
                    onClick={() => {
                      setStudentSubmitted(false);
                      setStudentSelectedOption(null);
                    }}
                  >
                    Reset Challenge
                  </button>
                )}
              </div>
            </div>

            <div className="student-canvas-pane">
              {/* Compact toolbar for students */}
              <div className="alpha-top-bar" style={{ left: "16px", right: "16px", top: "16px" }}>
                <span style={{ fontSize: "12px", color: "white", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={14} style={{ color: "#fbbf24" }} />
                  Live Circuit Sandbox
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className={`alpha-action-btn ${simulating ? "success" : "secondary"}`}
                    onClick={() => setSimulating(prev => !prev)}
                  >
                    {simulating ? <Pause size={12} /> : <Play size={12} />}
                    {simulating ? "Simulation Active" : "Run Simulation"}
                  </button>
                  <button className="alpha-action-btn secondary" onClick={() => setPreviewMode(false)}>
                    Exit Preview
                  </button>
                </div>
              </div>
              
              {/* Canvas Render inside student pane */}
              <svg
                id="canvas-grid-bg"
                className="alpha-canvas-svg"
                style={{ backgroundColor: "#060913" }}
              >
                <defs>
                  <pattern id="student-grid" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.06)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#student-grid)" pointerEvents="none" />
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {wires.map(wire => {
                    const fromNode = nodes.find(n => n.id === wire.fromNode);
                    let val = 0;
                    if (fromNode) {
                      val = fromNode.type.includes("FF") || fromNode.type === "HALF_ADDER" || fromNode.type === "FULL_ADDER" || fromNode.type === "COMPARATOR" || fromNode.type === "ALU" || fromNode.type === "DEC"
                        ? fromNode.outputs?.[wire.fromPort] || 0
                        : fromNode.state || 0;
                    }
                    return (
                      <g key={wire.id}>
                        <path className="alpha-wire-bg" d={getWirePath(wire)} />
                        <path className={`alpha-wire ${val === 1 ? "high" : "low"}`} d={getWirePath(wire)} strokeWidth="2.5" />
                        {simulating && val === 1 && (
                          <path className="alpha-wire high pulse-flow" d={getWirePath(wire)} strokeWidth="2.5" />
                        )}
                      </g>
                    );
                  })}
                  {nodes.map(node => renderNodeSvg(node))}
                </g>
              </svg>
            </div>
          </div>
        ) : (
          /* REGULAR ADMIN EDITOR VIEWPORT */
          <>
            {/* TOP FLOATING TOOLBAR */}
            <header className="alpha-top-bar">
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <button className="alpha-tool-btn" onClick={handleUndo} disabled={undoStack.length === 0} title="Undo (Ctrl+Z)">
                  <Undo size={16} />
                </button>
                <button className="alpha-tool-btn" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)">
                  <Redo size={16} />
                </button>
                <div className="alpha-tool-divider" />
                <button className="alpha-tool-btn" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} title="Zoom Out">
                  <ZoomOut size={16} />
                </button>
                <span style={{ fontSize: "11px", fontWeight: "600", width: "40px", textAlign: "center" }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button className="alpha-tool-btn" onClick={() => setZoom(z => Math.min(3.0, z + 0.1))} title="Zoom In">
                  <ZoomIn size={16} />
                </button>
                <button className="alpha-tool-btn" onClick={handleFitScreen} title="Fit screen center">
                  <Maximize size={14} />
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  className={`alpha-action-btn ${simulating ? "success" : "secondary"}`}
                  onClick={() => setSimulating(prev => !prev)}
                >
                  {simulating ? <Pause size={14} /> : <Play size={14} />}
                  {simulating ? "Sim Active" : "Simulate"}
                </button>
                
                <button className="alpha-action-btn secondary" onClick={() => setPreviewMode(true)}>
                  <Eye size={14} />
                  Preview View
                </button>

                <div className="alpha-tool-divider" />

                <label className="alpha-action-btn secondary" style={{ cursor: "pointer" }}>
                  <Upload size={14} />
                  Import
                  <input type="file" onChange={handleImportJSON} style={{ display: "none" }} accept=".json" />
                </label>

                <button className="alpha-action-btn secondary" onClick={handleExportJSON}>
                  <Download size={14} />
                  Export
                </button>

                <button className="alpha-action-btn primary" onClick={handleSaveToDatabase}>
                  <Save size={14} />
                  Publish
                </button>
              </div>
            </header>

            {/* SIMULATION PANEL OVERLAY */}
            {simulating && (
              <div className="alpha-sim-panel">
                <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#10b981", letterSpacing: "0.5px" }}>
                  Simulation Settings
                </div>
                <div className="alpha-field-row" style={{ margin: 0 }}>
                  <button
                    className={`alpha-action-btn ${simSpeed === 1.0 ? "primary" : "secondary"}`}
                    style={{ padding: "4px 8px", fontSize: "10px" }}
                    onClick={() => setSimSpeed(1.0)}
                  >
                    1.0x Speed
                  </button>
                  <button
                    className={`alpha-action-btn ${simSpeed === 2.0 ? "primary" : "secondary"}`}
                    style={{ padding: "4px 8px", fontSize: "10px" }}
                    onClick={() => setSimSpeed(2.0)}
                  >
                    2.0x Speed
                  </button>
                </div>
              </div>
            )}

            {/* INFINITE CANVAS GRAPHICS */}
            <svg
              id="canvas-grid-bg"
              className="alpha-canvas-svg"
              style={{ backgroundColor: "#0b0f19" }}
            >
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  <circle cx="15" cy="15" r="1.2" fill="rgba(255,255,255,0.08)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* TRANSFORMS SCALED GROUP */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Wires */}
                {wires.map(wire => {
                  const fromNode = nodes.find(n => n.id === wire.fromNode);
                  let val = 0;
                  if (fromNode) {
                    val = fromNode.type.includes("FF") || fromNode.type === "HALF_ADDER" || fromNode.type === "FULL_ADDER" || fromNode.type === "COMPARATOR" || fromNode.type === "ALU" || fromNode.type === "DEC"
                      ? fromNode.outputs?.[wire.fromPort] || 0
                      : fromNode.state || 0;
                  }
                  const isSelected = selectedWireId === wire.id;
                  const customColor = wire.color;

                  return (
                    <g key={wire.id}>
                      {/* Thicker transparent line to make selecting wires easier */}
                      <path
                        className="alpha-wire-bg"
                        d={getWirePath(wire)}
                        onClick={() => {
                          setSelectedWireId(wire.id);
                          setSelectedNodeIds([]);
                        }}
                      />
                      <path
                        className={`alpha-wire ${isSelected ? "selected" : ""} ${val === 1 ? "high" : "low"}`}
                        d={getWirePath(wire)}
                        stroke={customColor || undefined}
                        strokeWidth="2.5"
                        onClick={() => {
                          setSelectedWireId(wire.id);
                          setSelectedNodeIds([]);
                        }}
                      />
                      {/* Moving light dashes for high values */}
                      {simulating && val === 1 && (
                        <path
                          className="alpha-wire high pulse-flow"
                          d={getWirePath(wire)}
                          strokeWidth="2.5"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Temporary Wire Drawing Guidance Line */}
                {drawingWire && (
                  <line
                    className="alpha-temp-wire"
                    x1={drawingWire.currentX}
                    y1={drawingWire.currentY}
                    x2={getPortPosition(nodes.find(n => n.id === drawingWire.fromNode), drawingWire.fromPort, drawingWire.isInput).x}
                    y2={getPortPosition(nodes.find(n => n.id === drawingWire.fromNode), drawingWire.fromPort, drawingWire.isInput).y}
                  />
                )}

                {/* Nodes */}
                {nodes.map(node => renderNodeSvg(node))}
              </g>
            </svg>

            {/* BOTTOM STATUS BAR */}
            <footer className="alpha-status-bar">
              <div>
                <span>Grid Snap: </span>
                <span
                  style={{ color: snapGrid ? "#10b981" : "#ef4444", fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => setSnapGrid(s => !s)}
                >
                  {snapGrid ? "ON" : "OFF"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                <span>Objects: {nodes.length}</span>
                <span>Connections: {wires.length}</span>
                <span>Coordinates: ({Math.round(-pan.x)}, {Math.round(-pan.y)})</span>
              </div>
            </footer>
          </>
        )}
      </main>

      {/* ===================== PROPERTIES PANEL ===================== */}
      {!previewMode && (
        <aside className="alpha-properties-panel">
          <div className="alpha-properties-section" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h3>Properties</h3>
            {selectedNode ? (
              <div>
                <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", textTransform: "uppercase" }}>
                  Selected Component
                </span>
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginTop: "4px", marginBottom: "16px" }}>
                  {selectedNode.type}
                </h4>

                <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                  <label className="alpha-field-label">Label</label>
                  <input
                    type="text"
                    className="alpha-property-input"
                    value={selectedNode.label || ""}
                    onChange={(e) => updateSelectedNodeProperty("label", e.target.value)}
                  />
                </div>

                <div className="alpha-field-row">
                  <div className="alpha-field-col">
                    <label className="alpha-field-label">Position X</label>
                    <input
                      type="number"
                      className="alpha-property-input"
                      value={Math.round(selectedNode.x)}
                      onChange={(e) => updateSelectedNodeProperty("x", Number(e.target.value))}
                    />
                  </div>
                  <div className="alpha-field-col">
                    <label className="alpha-field-label">Position Y</label>
                    <input
                      type="number"
                      className="alpha-property-input"
                      value={Math.round(selectedNode.y)}
                      onChange={(e) => updateSelectedNodeProperty("y", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                  <label className="alpha-field-label">Rotation</label>
                  <select
                    className="alpha-property-input"
                    value={selectedNode.rotation}
                    onChange={(e) => updateSelectedNodeProperty("rotation", Number(e.target.value))}
                  >
                    <option value={0}>0°</option>
                    <option value={90}>90°</option>
                    <option value={180}>180°</option>
                    <option value={270}>270°</option>
                  </select>
                </div>

                {["AND", "OR", "NAND", "NOR", "XOR", "XNOR"].includes(selectedNode.type) && (
                  <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                    <label className="alpha-field-label">Inputs Count</label>
                    <input
                      type="number"
                      min={2}
                      max={32}
                      className="alpha-property-input"
                      value={selectedNode.inputsCount || 2}
                      onChange={(e) => {
                        let count = Number(e.target.value);
                        if (isNaN(count) || count < 2) count = 2;
                        if (count > 32) count = 32;
                        saveHistoryState();
                        // Update inputsCount and delete wires going to non-existent pins
                        setNodes(prev =>
                          prev.map(n => (n.id === selectedNode.id ? { ...n, inputsCount: count } : n))
                        );
                        setWires(prev =>
                          prev.filter(w => {
                            if (w.toNode === selectedNode.id) {
                              const pinIdx = Number(w.toPort.replace("IN_", ""));
                              return pinIdx < count;
                            }
                            return true;
                          })
                        );
                      }}
                    />
                  </div>
                )}

                <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                  <label className="alpha-field-label">Color Token</label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    {["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"].map(c => (
                      <div
                        key={c}
                        className={`alpha-color-pill ${selectedNode.color === c ? "active" : ""}`}
                        style={{ backgroundColor: c }}
                        onClick={() => updateSelectedNodeProperty("color", c)}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <button
                    className="alpha-action-btn secondary"
                    style={{ width: "100%", justifyContent: "center", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}
                    onClick={() => handleDeleteNode(selectedNode.id)}
                  >
                    <Trash size={12} />
                    Delete Component
                  </button>
                </div>
              </div>
            ) : selectedWire ? (
              <div>
                <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", textTransform: "uppercase" }}>
                  Selected Connection
                </span>
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginTop: "4px", marginBottom: "16px" }}>
                  Wire Link
                </h4>

                <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                  <label className="alpha-field-label">Source Node</label>
                  <input
                    type="text"
                    className="alpha-property-input"
                    style={{ opacity: 0.6 }}
                    readOnly
                    value={`${selectedWire.fromNode} (${selectedWire.fromPort})`}
                  />
                </div>

                <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                  <label className="alpha-field-label">Destination Node</label>
                  <input
                    type="text"
                    className="alpha-property-input"
                    style={{ opacity: 0.6 }}
                    readOnly
                    value={`${selectedWire.toNode} (${selectedWire.toPort})`}
                  />
                </div>

                <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                  <label className="alpha-field-label">Routing Style</label>
                  <select
                    className="alpha-property-input"
                    value={wireRouteType}
                    onChange={(e) => setWireRouteType(e.target.value)}
                  >
                    <option value="orthogonal">Orthogonal</option>
                    <option value="bezier">Bezier Curve</option>
                    <option value="straight">Straight Line</option>
                  </select>
                </div>

                <div className="alpha-field-col" style={{ marginBottom: "12px" }}>
                  <label className="alpha-field-label">Wire Glow Color</label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    {["", "#3b82f6", "#10b981", "#ef4444", "#fbbf24", "#d946ef"].map(c => (
                      <div
                        key={c}
                        className={`alpha-color-pill ${selectedWire.color === c ? "active" : ""}`}
                        style={{ backgroundColor: c || "#475569" }}
                        onClick={() => {
                          setWires(prev =>
                            prev.map(w => (w.id === selectedWire.id ? { ...w, color: c } : w))
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <button
                    className="alpha-action-btn secondary"
                    style={{ width: "100%", justifyContent: "center", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}
                    onClick={() => {
                      saveHistoryState();
                      setWires(prev => prev.filter(w => w.id !== selectedWire.id));
                      setSelectedWireId(null);
                    }}
                  >
                    <Trash size={12} />
                    Disconnect Wire
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px 10px", textAlign: "center", color: "#64748b" }}>
                <HelpCircle size={24} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p style={{ fontSize: "12px" }}>Select a gate, switch, or wire on the canvas to configure properties.</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
