import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddQuestions.css";
import API_BASE from "../api";

const DIFF_COLORS = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };
const DIFF_BG     = { easy: "#f0fdf4", medium: "#fffbeb", hard: "#fef2f2" };

const emptyForm = {
  grade: "", subject: "", chapter: "", difficulty: "medium",
  question: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: ""
};

/* ─────────────────────────── SVG Diagram Helpers ─────────────────────────── */
const parseParams = (paramStr) => {
  const params = {};
  if (!paramStr) return params;
  paramStr.split("&").forEach(p => {
    const [key, val] = p.split("=");
    if (key && val) {
      params[key.trim().toLowerCase()] = decodeURIComponent(val.trim());
    }
  });
  return params;
};

function renderDiagramSvg(shape, params) {
  const containerStyle = {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)"
  };

  const shadowFilter = (
    <filter id="svg-preview-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="1" dy="2" stdDeviation="3" floodOpacity="0.15" />
    </filter>
  );

  switch (shape) {
    case "circle": {
      const radius = params.radius || "r";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <radialGradient id="circleGradPreview" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <circle cx="110" cy="110" r="75" stroke="#0284c7" strokeWidth="3" fill="url(#circleGradPreview)" filter="url(#svg-preview-shadow)" />
          <circle cx="110" cy="110" r="4" fill="#0369a1" />
          <line x1="110" y1="110" x2="185" y2="110" stroke="#0369a1" strokeWidth="2" strokeDasharray="4 3" />
          <text x="100" y="105" fontSize="12" fill="#0369a1" fontWeight="600" fontFamily="system-ui">O</text>
          <text x="148" y="100" fontSize="13" fill="#0369a1" fontWeight="700" fontFamily="system-ui" textAnchor="middle">r = {radius}</text>
        </svg>
      );
    }
    case "semicircle": {
      const radius = params.radius || "r";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <radialGradient id="semiGradPreview" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef3c7" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <path d="M 35,130 A 75,75 0 0,1 185,130 Z" stroke="#d97706" strokeWidth="3" fill="url(#semiGradPreview)" filter="url(#svg-preview-shadow)" />
          <circle cx="110" cy="130" r="4" fill="#b45309" />
          <line x1="110" y1="130" x2="163" y2="77" stroke="#b45309" strokeWidth="2" strokeDasharray="4 3" />
          <text x="100" y="146" fontSize="12" fill="#b45309" fontWeight="600" fontFamily="system-ui">O</text>
          <text x="142" y="98" fontSize="13" fill="#b45309" fontWeight="700" fontFamily="system-ui">r = {radius}</text>
        </svg>
      );
    }
    case "square": {
      const side = params.side || "s";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="squareGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdf4" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <rect x="50" y="50" width="120" height="120" stroke="#16a34a" strokeWidth="3" fill="url(#squareGradPreview)" filter="url(#svg-preview-shadow)" />
          <text x="110" y="40" fontSize="13" fill="#15803d" fontWeight="700" fontFamily="system-ui" textAnchor="middle">s = {side}</text>
          <line x1="45" y1="110" x2="55" y2="110" stroke="#16a34a" strokeWidth="1.5" />
          <line x1="165" y1="110" x2="175" y2="110" stroke="#16a34a" strokeWidth="1.5" />
          <line x1="110" y1="45" x2="110" y2="55" stroke="#16a34a" strokeWidth="1.5" />
          <line x1="110" y1="165" x2="110" y2="175" stroke="#16a34a" strokeWidth="1.5" />
        </svg>
      );
    }
    case "rectangle": {
      const width = params.width || "w";
      const height = params.height || "h";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="rectGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#faf5ff" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <rect x="40" y="65" width="140" height="90" stroke="#7c3aed" strokeWidth="3" fill="url(#rectGradPreview)" filter="url(#svg-preview-shadow)" />
          <text x="110" y="176" fontSize="13" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="middle">w = {width}</text>
          <text x="188" y="114" fontSize="13" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="start">h = {height}</text>
        </svg>
      );
    }
    case "triangle": {
      const base = params.base || "b";
      const height = params.height || "h";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="triGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef2f2" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="40,155 180,155 110,65" stroke="#dc2626" strokeWidth="3" fill="url(#triGradPreview)" filter="url(#svg-preview-shadow)" />
          <line x1="110" y1="65" x2="110" y2="155" stroke="#b91c1c" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="110" y="145" width="10" height="10" fill="none" stroke="#b91c1c" strokeWidth="1.2" />
          <text x="110" y="176" fontSize="13" fill="#b91c1c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">b = {base}</text>
          <text x="120" y="115" fontSize="13" fill="#b91c1c" fontWeight="700" fontFamily="system-ui" textAnchor="start">h = {height}</text>
        </svg>
      );
    }
    case "concentriccircles": {
      const r1 = params.r1 || "r₁";
      const r2 = params.r2 || "r₂";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <radialGradient id="conc1Preview" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ecfeff" />
            </radialGradient>
            <radialGradient id="conc2Preview" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#f0f9ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <circle cx="110" cy="110" r="75" stroke="#0284c7" strokeWidth="2.5" fill="url(#conc2Preview)" filter="url(#svg-preview-shadow)" />
          <circle cx="110" cy="110" r="45" stroke="#0891b2" strokeWidth="2.5" fill="url(#conc1Preview)" />
          <circle cx="110" cy="110" r="4" fill="#0369a1" />
          <line x1="110" y1="110" x2="142" y2="78" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="126" y="86" fontSize="11" fill="#0891b2" fontWeight="700" fontFamily="system-ui">r₁={r1}</text>
          <line x1="110" y1="110" x2="185" y2="110" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="162" y="104" fontSize="11" fill="#0284c7" fontWeight="700" fontFamily="system-ui">r₂={r2}</text>
          <text x="102" y="105" fontSize="12" fill="#0369a1" fontWeight="600" fontFamily="system-ui">O</text>
        </svg>
      );
    }
    case "venn": {
      const label1 = params.label1 || "A";
      const label2 = params.label2 || "B";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            {shadowFilter}
          </defs>
          <g filter="url(#svg-preview-shadow)">
            <circle cx="85" cy="110" r="50" stroke="#4f46e5" strokeWidth="2.5" fill="#e0e7ff" fillOpacity="0.6" />
            <circle cx="135" cy="110" r="50" stroke="#06b6d4" strokeWidth="2.5" fill="#ecfeff" fillOpacity="0.6" />
          </g>
          <text x="60" y="114" fontSize="14" fill="#312e81" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{label1}</text>
          <text x="160" y="114" fontSize="14" fill="#083344" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{label2}</text>
          <text x="110" y="114" fontSize="11" fill="#0f172a" fontWeight="600" fontFamily="system-ui" textAnchor="middle">A ∩ B</text>
        </svg>
      );
    }
    case "ellipse": {
      const rx = params.rx || "a";
      const ry = params.ry || "b";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <radialGradient id="ellGradPreview" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#faf5ff" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <ellipse cx="110" cy="110" rx="75" ry="45" stroke="#7c3aed" strokeWidth="3" fill="url(#ellGradPreview)" filter="url(#svg-preview-shadow)" />
          <circle cx="110" cy="110" r="4" fill="#6d28d9" />
          <line x1="35" y1="110" x2="185" y2="110" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="110" y1="65" x2="110" y2="155" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="148" y="104" fontSize="11" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="middle">rx = {rx}</text>
          <text x="115" y="85" fontSize="11" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="start">ry = {ry}</text>
        </svg>
      );
    }
    case "polygon": {
      const numSides = parseInt(params.sides) || 5;
      const side = params.side || params.sidelength || "s";
      const points = [];
      for (let i = 0; i < numSides; i++) {
        const angle = (i * 2 * Math.PI / numSides) - Math.PI / 2;
        const x = 110 + 65 * Math.cos(angle);
        const y = 110 + 65 * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      const midAngle = (Math.PI / numSides) - Math.PI / 2;
      const labelX = 110 + 78 * Math.cos(midAngle);
      const labelY = 110 + 78 * Math.sin(midAngle);
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="polyGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdf4" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points={points.join(" ")} stroke="#16a34a" strokeWidth="3" fill="url(#polyGradPreview)" filter="url(#svg-preview-shadow)" />
          <text x="110" y="114" fontSize="12" fill="#15803d" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{numSides} Sides</text>
          <text x={labelX} y={labelY} fontSize="12" fill="#15803d" fontWeight="700" fontFamily="system-ui" textAnchor="middle">s = {side}</text>
        </svg>
      );
    }
    case "piechart": {
      const vals = (params.values || "40,35,25").split(",").map(Number);
      const lbls = (params.labels || "A,B,C").split(",");
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
      const total = vals.reduce((sum, v) => sum + v, 0);
      
      let cumulativeAngle = 0;
      const slices = vals.map((val, i) => {
        const angle = (val / total) * 2 * Math.PI;
        const x1 = 85 + 55 * Math.cos(cumulativeAngle - Math.PI / 2);
        const y1 = 110 + 55 * Math.sin(cumulativeAngle - Math.PI / 2);
        cumulativeAngle += angle;
        const x2 = 85 + 55 * Math.cos(cumulativeAngle - Math.PI / 2);
        const y2 = 110 + 55 * Math.sin(cumulativeAngle - Math.PI / 2);
        
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        const pathData = `M 85,110 L ${x1},${y1} A 55,55 0 ${largeArcFlag},1 ${x2},y2 Z`;
        
        // Let's replace simple templates
        const safeY2 = isNaN(y2) ? 110 : y2;
        const safeX2 = isNaN(x2) ? 85 : x2;
        const pathString = `M 85,110 L ${x1},${y1} A 55,55 0 ${largeArcFlag},1 ${safeX2},${safeY2} Z`;

        return (
          <path
            key={i}
            d={pathString}
            fill={colors[i % colors.length]}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        );
      });
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>{shadowFilter}</defs>
          <g filter="url(#svg-preview-shadow)">
            {slices}
          </g>
          <g transform="translate(150, 40)">
            {vals.map((val, i) => (
              <g key={i} transform={`translate(0, ${i * 22})`}>
                <rect width="12" height="12" rx="3" fill={colors[i % colors.length]} />
                <text x="18" y="10" fontSize="10" fill="#334155" fontWeight="600" fontFamily="system-ui">
                  {lbls[i] || `Item ${i+1}`} ({val}%)
                </text>
              </g>
            ))}
          </g>
        </svg>
      );
    }
    case "numberline": {
      const minVal = parseInt(params.min) || -5;
      const maxVal = parseInt(params.max) || 5;
      const activePoints = (params.points || "").split(",").map(Number).filter(n => !isNaN(n));
      const range = maxVal - minVal;
      const ticks = [];
      const step = range <= 10 ? 1 : Math.round(range / 10) || 1;
      for (let val = minVal; val <= maxVal; val += step) {
        const pct = (val - minVal) / range;
        const x = 30 + pct * 160;
        ticks.push(
          <g key={val}>
            <line x1={x} y1={105} x2={x} y2={115} stroke="#334155" strokeWidth="1.5" />
            <text x={x} y={130} fontSize="10" fill="#334155" textAnchor="middle" fontFamily="system-ui">{val}</text>
          </g>
        );
      }
      const pointsElements = activePoints.map((pt, i) => {
        const pct = (pt - minVal) / range;
        const x = 30 + pct * 160;
        return (
          <g key={i}>
            <circle cx={x} cy={110} r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <text x={x} y={98} fontSize="11" fill="#b91c1c" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">{pt}</text>
          </g>
        );
      });
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <line x1="25" y1="110" x2="195" y2="110" stroke="#334155" strokeWidth="2.5" />
          <path d="M 25,110 L 32,105 M 25,110 L 32,115" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 195,110 L 188,105 M 195,110 L 188,115" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          {ticks}
          {pointsElements}
        </svg>
      );
    }
    case "coordinategraph": {
      const pointsStr = params.points || "";
      const parsedPoints = pointsStr.split(";").map(p => {
        const [x, y] = p.split(",").map(Number);
        return { x, y };
      }).filter(p => !isNaN(p.x) && !isNaN(p.y));

      const gridLines = [];
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        const pos = 110 + i * 22;
        gridLines.push(<line key={`v-${i}`} x1={pos} y1={20} x2={pos} y2={200} stroke="#e2e8f0" strokeWidth="1" />);
        gridLines.push(<line key={`h-${i}`} x1={20} y1={pos} x2={200} y2={pos} stroke="#e2e8f0" strokeWidth="1" />);
        gridLines.push(
          <g key={`labels-${i}`}>
            <text x={pos} y={122} fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="system-ui">{i}</text>
            <text x={98} y={pos + 3} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="system-ui">{i}</text>
          </g>
        );
      }

      const pointElements = parsedPoints.map((pt, idx) => {
        const px = 110 + pt.x * 22;
        const py = 110 - pt.y * 22;
        return (
          <g key={idx}>
            <circle cx={px} cy={py} r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            <text x={px + 6} y={py - 6} fontSize="10" fill="#1d4ed8" fontWeight="bold" fontFamily="system-ui">({pt.x},{pt.y})</text>
          </g>
        );
      });

      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          {gridLines}
          <line x1="20" y1="110" x2="200" y2="110" stroke="#475569" strokeWidth="2" />
          <line x1="110" y1="20" x2="110" y2="200" stroke="#475569" strokeWidth="2" />
          <text x="195" y="105" fontSize="10" fill="#475569" fontWeight="bold" fontFamily="system-ui">X</text>
          <text x="115" y="28" fontSize="10" fill="#475569" fontWeight="bold" fontFamily="system-ui">Y</text>
          {pointElements}
        </svg>
      );
    }
    case "parabola": {
      const eq = params.equation || "y = x²";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>{shadowFilter}</defs>
          <line x1="20" y1="150" x2="200" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 40,65 Q 110,185 180,65" stroke="#ef4444" strokeWidth="3" fill="none" filter="url(#svg-preview-shadow)" />
          <circle cx="110" cy="125" r="4.5" fill="#b91c1c" />
          <text x="120" y="129" fontSize="11" fill="#b91c1c" fontWeight="bold" fontFamily="system-ui">Focus (F)</text>
          <text x="110" y="45" fontSize="13" fill="#b91c1c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{eq}</text>
        </svg>
      );
    }
    case "hyperbola": {
      const eq = params.equation || "x²/a² - y²/b² = 1";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>{shadowFilter}</defs>
          <line x1="40" y1="50" x2="180" y2="170" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="40" y1="170" x2="180" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
          <path d="M 45,55 Q 95,110 45,165" stroke="#8b5cf6" strokeWidth="3" fill="none" filter="url(#svg-preview-shadow)" />
          <path d="M 175,55 Q 125,110 175,165" stroke="#8b5cf6" strokeWidth="3" fill="none" filter="url(#svg-preview-shadow)" />
          <text x="110" y="38" fontSize="12" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{eq}</text>
        </svg>
      );
    }
    case "quadrilateral": {
      const lbl = params.label || "ABCD";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="quadGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="50,75 160,60 175,150 65,165" stroke="#2563eb" strokeWidth="3" fill="url(#quadGradPreview)" filter="url(#svg-preview-shadow)" />
          <text x="40" y="70" fontSize="12" fill="#1e40af" fontWeight="bold" fontFamily="system-ui">{lbl[0] || 'A'}</text>
          <text x="170" y="55" fontSize="12" fill="#1e40af" fontWeight="bold" fontFamily="system-ui">{lbl[1] || 'B'}</text>
          <text x="185" y="160" fontSize="12" fill="#1e40af" fontWeight="bold" fontFamily="system-ui">{lbl[2] || 'C'}</text>
          <text x="50" y="175" fontSize="12" fill="#1e40af" fontWeight="bold" fontFamily="system-ui">{lbl[3] || 'D'}</text>
        </svg>
      );
    }
    case "rhombus": {
      const d1 = params.d1 || "d₁";
      const d2 = params.d2 || "d₂";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="rhomGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff7ed" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="110,45 175,110 110,175 45,110" stroke="#ea580c" strokeWidth="3" fill="url(#rhomGradPreview)" filter="url(#svg-preview-shadow)" />
          <line x1="110" y1="45" x2="110" y2="175" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="45" y1="110" x2="175" y2="110" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 110,100 L 120,100 L 120,110" fill="none" stroke="#ea580c" strokeWidth="1.2" />
          <text x="96" y="80" fontSize="11" fill="#c2410c" fontWeight="700" fontFamily="system-ui">d₁={d1}</text>
          <text x="142" y="124" fontSize="11" fill="#c2410c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">d₂={d2}</text>
        </svg>
      );
    }
    case "parallelogram": {
      const b = params.base || "b";
      const h = params.height || "h";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="paraGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdfa" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="65,70 185,70 155,150 35,150" stroke="#0d9488" strokeWidth="3" fill="url(#paraGradPreview)" filter="url(#svg-preview-shadow)" />
          <line x1="65" y1="70" x2="65" y2="150" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="65" y="140" width="10" height="10" fill="none" stroke="#0d9488" strokeWidth="1.2" />
          <text x="95" y="166" fontSize="12" fill="#0f766e" fontWeight="700" fontFamily="system-ui" textAnchor="middle">base = {b}</text>
          <text x="75" y="115" fontSize="12" fill="#0f766e" fontWeight="700" fontFamily="system-ui">height = {h}</text>
        </svg>
      );
    }
    case "trapezium": {
      const a = params.a || "a";
      const b = params.b || "b";
      const h = params.h || "h";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="trapGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff1f2" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="75,70 145,70 185,150 35,150" stroke="#e11d48" strokeWidth="3" fill="url(#trapGradPreview)" filter="url(#svg-preview-shadow)" />
          <line x1="75" y1="70" x2="75" y2="150" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="75" y="140" width="10" height="10" fill="none" stroke="#e11d48" strokeWidth="1.2" />
          <text x="110" y="62" fontSize="12" fill="#be123c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">a = {a}</text>
          <text x="110" y="166" fontSize="12" fill="#be123c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">b = {b}</text>
          <text x="85" y="115" fontSize="12" fill="#be123c" fontWeight="700" fontFamily="system-ui">h = {h}</text>
        </svg>
      );
    }
    default:
      return null;
  }
}

function renderQuestionText(questionText) {
  if (!questionText) return null;

  const regex = /\[(Circle|Semicircle|Square|Rectangle|Triangle|ConcentricCircles|Venn|Ellipse|Polygon|PieChart|NumberLine|CoordinateGraph|Parabola|Hyperbola|Quadrilateral|Rhombus|Parallelogram|Trapezium)SVG:\s*([^\]]+)\]/gi;
  const matches = [...questionText.matchAll(regex)];

  if (matches.length === 0) {
    return (
      <p className="aq-preview-q">
        {questionText}
      </p>
    );
  }

  const elements = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const matchIndex = match.index;
    const shape = match[1].toLowerCase();
    const paramStr = match[2];
    const params = parseParams(paramStr);

    if (matchIndex > lastIndex) {
      elements.push(
        <span key={`text-pre-${index}`} className="aq-preview-q">
          {questionText.substring(lastIndex, matchIndex)}
        </span>
      );
    }

    elements.push(
      <div 
        key={`diagram-${index}`} 
        style={{ display: "flex", justifyContent: "center", margin: "15px 0" }}
      >
        {renderDiagramSvg(shape, params)}
      </div>
    );

    lastIndex = matchIndex + match[0].length;
  });

  if (lastIndex < questionText.length) {
    elements.push(
      <span key="text-post" className="aq-preview-q">
        {questionText.substring(lastIndex)}
      </span>
    );
  }

  return <div style={{ marginBottom: "15px" }}>{elements}</div>;
}

/* ─────────────────────────── Preview Panel ──────────────────────────── */
function QuestionPreview({ form }) {
  const [selected, setSelected] = useState(null);

  // reset selection when form changes
  useEffect(() => setSelected(null), [form.question]);

  const optionStyle = (i) => {
    const base = {
      display: "block", width: "100%", padding: "10px 14px",
      marginBottom: "8px", borderRadius: "10px", border: "1.5px solid",
      cursor: "pointer", textAlign: "left", fontSize: "14px",
      fontWeight: "500", transition: "all 0.2s",
    };
    if (selected !== null) {
      if (i === form.correctAnswerIndex)
        return { ...base, background: "#f0fdf4", borderColor: "#22c55e", color: "#15803d" };
      if (i === selected)
        return { ...base, background: "#fef2f2", borderColor: "#ef4444", color: "#b91c1c" };
    }
    return { ...base, background: selected === i ? "#eff6ff" : "#f8fafc", borderColor: "#e2e8f0", color: "#374151" };
  };

  const hasContent = form.question.trim() && form.options.some(o => o.trim());

  return (
    <div className="aq-preview-panel">
      <div className="aq-preview-header">
        <span className="aq-preview-badge">👁 Live Preview</span>
        <span
          className="aq-diff-badge"
          style={{ background: DIFF_BG[form.difficulty], color: DIFF_COLORS[form.difficulty] }}
        >
          {form.difficulty}
        </span>
      </div>

      {!hasContent ? (
        <div className="aq-preview-empty">
          <span>📝</span>
          <p>Fill in the question and options on the left to see a preview here.</p>
        </div>
      ) : (
        <div className="aq-preview-card">
          {/* Meta */}
          {(form.grade || form.subject || form.chapter) && (
            <div className="aq-preview-meta">
              {form.subject && <span>{form.subject}</span>}
              {form.grade   && <span>Class {form.grade}</span>}
              {form.chapter && <span>{form.chapter}</span>}
            </div>
          )}

          {/* Question */}
          {renderQuestionText(form.question || "Your question will appear here…")}

          {/* Options */}
          <div style={{ marginTop: "12px" }}>
            {form.options.map((opt, i) => (
              opt.trim() ? (
                <button key={i} style={optionStyle(i)} onClick={() => setSelected(i)}>
                  <span className="aq-opt-letter">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ) : null
            ))}
          </div>

          {/* Result feedback */}
          {selected !== null && (
            <div className={`aq-preview-feedback ${selected === form.correctAnswerIndex ? 'correct' : 'wrong'}`}>
              {selected === form.correctAnswerIndex ? "✅ Correct!" : "❌ Incorrect"}
              {form.explanation && <p className="aq-preview-expl">💡 {form.explanation}</p>}
            </div>
          )}

          {selected === null && (
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
              Click an option to test the preview
            </p>
          )}
        </div>
      )}
    </div>
  );
}


/* ─────────────────────────── Question Row ──────────────────────────── */
function QuestionRow({ q, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="aq-q-row">
      <div className="aq-q-row-meta">
        <span
          className="aq-diff-badge sm"
          style={{ background: DIFF_BG[q.difficulty], color: DIFF_COLORS[q.difficulty] }}
        >
          {q.difficulty}
        </span>
        <span className="aq-q-chapter">{q.chapter}</span>
        <span className="aq-q-grade">Gr {q.grade}</span>
      </div>
      <p className="aq-q-text">{q.content?.en?.question}</p>
      <div className="aq-q-actions">
        <button className="aq-btn edit" onClick={() => onEdit(q)}>✏️ Edit</button>
        {!confirming ? (
          <button className="aq-btn delete" onClick={() => setConfirming(true)}>🗑 Delete</button>
        ) : (
          <>
            <button className="aq-btn delete-confirm" onClick={() => onDelete(q._id)}>Confirm</button>
            <button className="aq-btn cancel" onClick={() => setConfirming(false)}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────────── */
export default function AddQuestions() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";

  // Redirect non-admins immediately
  useEffect(() => { if (!isAdmin) navigate("/"); }, [isAdmin]);

  const [subjectsList, setSubjectsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null); // null = adding new

  // Filter state (for browsing existing questions)
  const [filterGrade, setFilterGrade]     = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterChapters, setFilterChapters] = useState([]);

  const [existingQs, setExistingQs] = useState([]);
  const [loadingQs, setLoadingQs]   = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null); // { msg, type }
  const [tab, setTab] = useState("browse"); // "browse" | "form"

  // Load subjects
  useEffect(() => {
    fetch(`${API_BASE}/api/subjects`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSubjectsList(data); })
      .catch(() => {});
  }, []);

  // Load chapters for form (grade+subject)
  useEffect(() => {
    if (!form.grade || !form.subject) { setChaptersList([]); setForm(f => ({ ...f, chapter: "" })); return; }
    fetch(`${API_BASE}/api/subjects/chapters?subject=${encodeURIComponent(form.subject)}&grade=${form.grade}`)
      .then(r => r.json())
      .then(data => { setChaptersList(Array.isArray(data) ? data : []); setForm(f => ({ ...f, chapter: "" })); })
      .catch(() => setChaptersList([]));
  }, [form.grade, form.subject]);

  // Load chapters for filter
  useEffect(() => {
    if (!filterGrade || !filterSubject) { setFilterChapters([]); setFilterChapter(""); return; }
    fetch(`${API_BASE}/api/subjects/chapters?subject=${encodeURIComponent(filterSubject)}&grade=${filterGrade}`)
      .then(r => r.json())
      .then(data => { setFilterChapters(Array.isArray(data) ? data : []); setFilterChapter(""); })
      .catch(() => setFilterChapters([]));
  }, [filterGrade, filterSubject]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch existing questions ──────────────────────────────────────
  const fetchQuestions = () => {
    setLoadingQs(true);
    const p = new URLSearchParams();
    if (filterGrade)   p.set("grade", filterGrade);
    if (filterSubject) p.set("subject", filterSubject);
    if (filterChapter) p.set("chapter", filterChapter);
    fetch(`${API_BASE}/api/questions/admin?${p.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setExistingQs(Array.isArray(data) ? data : []); setLoadingQs(false); })
      .catch(() => { setExistingQs([]); setLoadingQs(false); });
  };

  // ── Edit handler ──────────────────────────────────────────────────
  const handleEdit = (q) => {
    setForm({
      grade:              q.grade,
      subject:            q.subject,
      chapter:            q.chapter,
      difficulty:         q.difficulty,
      question:           q.content?.en?.question || "",
      options:            q.content?.en?.options  || ["","","",""],
      correctAnswerIndex: q.correctAnswerIndex,
      explanation:        q.content?.en?.explanation || ""
    });
    setEditingId(q._id);
    setShowPreview(false);
    setTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete handler ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Question deleted ✅");
        setExistingQs(prev => prev.filter(q => q._id !== id));
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
  };

  // ── Save (add or update) ──────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      grade: form.grade, subject: form.subject, chapter: form.chapter,
      difficulty: form.difficulty, question: form.question,
      options: form.options, correctAnswerIndex: Number(form.correctAnswerIndex),
      explanation: form.explanation
    };
    try {
      const url    = editingId
        ? `${API_BASE}/api/questions/${editingId}`
        : `${API_BASE}/api/questions/add`;
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editingId ? "Question updated ✅" : "Question added ✅");
        setForm({ ...emptyForm });
        setEditingId(null);
        setShowPreview(false);
        setTab("browse");
        // Refresh list if filters match
        if (filterGrade || filterSubject || filterChapter) fetchQuestions();
      } else {
        showToast(data.error || data.message || "Save failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
    setSaving(false);
  };

  const setOpt = (i, v) => setForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o }; });

  if (!isAdmin) return null;

  return (
    <div className="aq-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`aq-toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── Page Header ── */}
      <div className="aq-page-header">
        <div>
          <h1 className="aq-page-title">Question Manager</h1>
          <p className="aq-page-sub">Admin panel · Add, edit and preview questions</p>
        </div>
        <div className="aq-tab-bar">
          <button className={`aq-tab ${tab === "browse" ? "active" : ""}`} onClick={() => setTab("browse")}>
            📋 Browse Questions
          </button>
          <button
            className={`aq-tab ${tab === "form" ? "active" : ""}`}
            onClick={() => { setTab("form"); setEditingId(null); setForm({ ...emptyForm }); }}
          >
            ➕ Add Question
          </button>
        </div>
      </div>

      {/* ══════════ TAB: BROWSE ══════════ */}
      {tab === "browse" && (
        <div className="aq-section">
          <div className="aq-filter-bar">
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="aq-select">
              <option value="">All Grades</option>
              {[...Array(12)].map((_,i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
            </select>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="aq-select">
              <option value="">All Subjects</option>
              {subjectsList.map(s => <option key={s.subjectId} value={s.title}>{s.title}</option>)}
            </select>
            <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)} className="aq-select" disabled={!filterChapters.length}>
              <option value="">All Chapters</option>
              {filterChapters.map(ch => <option key={ch} value={ch}>{ch}</option>)}
            </select>
            <button className="aq-btn primary" onClick={fetchQuestions}>🔍 Search</button>
          </div>

          {loadingQs ? (
            <div className="aq-loading"><div className="aq-spinner" /><span>Loading…</span></div>
          ) : existingQs.length === 0 ? (
            <div className="aq-empty">
              <span>📭</span>
              <p>Apply filters above and click Search to browse questions.</p>
            </div>
          ) : (
            <div className="aq-q-list">
              <p className="aq-q-count">{existingQs.length} question{existingQs.length !== 1 ? 's' : ''} found</p>
              {existingQs.map(q => (
                <QuestionRow key={q._id} q={q} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB: FORM ══════════ */}
      {tab === "form" && (
        <div className="aq-form-layout">

          {/* ── Left: Form ── */}
          <div className="aq-form-col">
            <div className="aq-section">
              <div className="aq-section-head">
                <h2>{editingId ? "✏️ Edit Question" : "➕ New Question"}</h2>
                {editingId && (
                  <button className="aq-btn cancel" onClick={() => { setEditingId(null); setForm({ ...emptyForm }); }}>
                    × Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="aq-form">
                {/* Row: Grade + Subject */}
                <div className="aq-form-row">
                  <div className="aq-field">
                    <label className="aq-label">Grade *</label>
                    <select value={form.grade} onChange={e => setForm(f=>({...f, grade:e.target.value}))} required className="aq-select">
                      <option value="">Select Grade</option>
                      {[...Array(12)].map((_,i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
                    </select>
                  </div>
                  <div className="aq-field">
                    <label className="aq-label">Subject *</label>
                    <select value={form.subject} onChange={e => setForm(f=>({...f, subject:e.target.value}))} required className="aq-select">
                      <option value="">Select Subject</option>
                      {subjectsList.map(s => <option key={s.subjectId} value={s.title}>{s.title}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: Chapter + Difficulty */}
                <div className="aq-form-row">
                  <div className="aq-field">
                    <label className="aq-label">Chapter *</label>
                    <select value={form.chapter} onChange={e => setForm(f=>({...f, chapter:e.target.value}))} required className="aq-select" disabled={!chaptersList.length}>
                      <option value="">{!form.grade || !form.subject ? "Select grade & subject first" : chaptersList.length ? "Select Chapter" : "No chapters available"}</option>
                      {chaptersList.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                    </select>
                  </div>
                  <div className="aq-field">
                    <label className="aq-label">Difficulty *</label>
                    <div className="aq-diff-toggle">
                      {["easy","medium","hard"].map(d => (
                        <button
                          type="button" key={d}
                          className={`aq-diff-btn ${form.difficulty === d ? 'selected' : ''}`}
                          style={form.difficulty === d ? { background: DIFF_BG[d], color: DIFF_COLORS[d], borderColor: DIFF_COLORS[d] } : {}}
                          onClick={() => setForm(f=>({...f, difficulty:d}))}
                        >
                          {d.charAt(0).toUpperCase()+d.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <div className="aq-field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
                    <label className="aq-label" style={{ margin: 0 }}>Question *</label>
                    <div className="aq-diagram-toolbar" style={{ display: "flex", gap: "6px", flexWrap: "wrap", background: "#f1f5f9", padding: "8px", borderRadius: "10px", width: "100%", boxSizing: "border-box" }}>
                      <button
                        type="button"
                        onClick={() => {
                          const r = prompt("Enter circle radius (e.g. 7 cm):", "7 cm");
                          if (r) setForm(f => ({ ...f, question: f.question + ` [CircleSVG: radius=${r}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1e40af", cursor: "pointer", fontWeight: "600" }}
                      >
                        ⭕ Circle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const r = prompt("Enter semicircle radius (e.g. 7 cm):", "7 cm");
                          if (r) setForm(f => ({ ...f, question: f.question + ` [SemicircleSVG: radius=${r}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #fed7aa", background: "#fff7ed", color: "#c2410c", cursor: "pointer", fontWeight: "600" }}
                      >
                        🌙 Semicircle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const s = prompt("Enter square side (e.g. 5 cm):", "5 cm");
                          if (s) setForm(f => ({ ...f, question: f.question + ` [SquareSVG: side=${s}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#15803d", cursor: "pointer", fontWeight: "600" }}
                      >
                        🟩 Square
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const w = prompt("Enter rectangle width (e.g. 8 cm):", "8 cm");
                          if (!w) return;
                          const h = prompt("Enter rectangle height (e.g. 5 cm):", "5 cm");
                          if (h) setForm(f => ({ ...f, question: f.question + ` [RectangleSVG: width=${w}&height=${h}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #e9d5ff", background: "#faf5ff", color: "#6d28d9", cursor: "pointer", fontWeight: "600" }}
                      >
                        ▭ Rectangle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const b = prompt("Enter triangle base (e.g. 6 cm):", "6 cm");
                          if (!b) return;
                          const h = prompt("Enter triangle height (e.g. 4 cm):", "4 cm");
                          if (h) setForm(f => ({ ...f, question: f.question + ` [TriangleSVG: base=${b}&height=${h}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", cursor: "pointer", fontWeight: "600" }}
                      >
                        🔺 Triangle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const r1 = prompt("Enter inner radius r1 (e.g. 3 cm):", "3 cm");
                          if (!r1) return;
                          const r2 = prompt("Enter outer radius r2 (e.g. 5 cm):", "5 cm");
                          if (r2) setForm(f => ({ ...f, question: f.question + ` [ConcentricCirclesSVG: r1=${r1}&r2=${r2}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #a5f3fc", background: "#ecfeff", color: "#0891b2", cursor: "pointer", fontWeight: "600" }}
                      >
                        🎯 Concentric Circles
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const l1 = prompt("Enter left circle label (e.g. A):", "A");
                          if (!l1) return;
                          const l2 = prompt("Enter right circle label (e.g. B):", "B");
                          if (l2) setForm(f => ({ ...f, question: f.question + ` [VennSVG: label1=${l1}&label2=${l2}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #ddd6fe", background: "#f5f3ff", color: "#4f46e5", cursor: "pointer", fontWeight: "600" }}
                      >
                        ☯️ Venn Diagram
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const rx = prompt("Enter horizontal radius rx (e.g. 5 cm):", "5 cm");
                          if (!rx) return;
                          const ry = prompt("Enter vertical radius ry (e.g. 3 cm):", "3 cm");
                          if (ry) setForm(f => ({ ...f, question: f.question + ` [EllipseSVG: rx=${rx}&ry=${ry}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #f3e8ff", background: "#faf5ff", color: "#7c3aed", cursor: "pointer", fontWeight: "600" }}
                      >
                        ⬭ Ellipse
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const s = prompt("Enter number of sides (e.g. 5, 6, 8):", "5");
                          if (!s) return;
                          const side = prompt("Enter side label (e.g. 4 cm):", "4 cm");
                          if (side) setForm(f => ({ ...f, question: f.question + ` [PolygonSVG: sides=${s}&side=${side}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", cursor: "pointer", fontWeight: "600" }}
                      >
                        ⬡ Polygon
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const vals = prompt("Enter percentages (sum to 100, e.g. 40,35,25):", "40,35,25");
                          if (!vals) return;
                          const lbls = prompt("Enter labels (e.g. A,B,C):", "A,B,C");
                          if (lbls) setForm(f => ({ ...f, question: f.question + ` [PieChartSVG: values=${vals}&labels=${lbls}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #fed7aa", background: "#fff7ed", color: "#ea580c", cursor: "pointer", fontWeight: "600" }}
                      >
                        📊 Pie Chart
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const min = prompt("Enter min value (e.g. -5):", "-5");
                          if (!min) return;
                          const max = prompt("Enter max value (e.g. 5):", "5");
                          if (!max) return;
                          const pts = prompt("Enter plotted points (optional, e.g. -2,3):", "-2,3");
                          setForm(f => ({ ...f, question: f.question + ` [NumberLineSVG: min=${min}&max=${max}&points=${pts || ""}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", cursor: "pointer", fontWeight: "600" }}
                      >
                        📏 Number Line
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pts = prompt("Enter coordinate points to plot x,y separated by semicolons (e.g. 2,3;-1,-2):", "2,3;-1,-2");
                          if (pts) setForm(f => ({ ...f, question: f.question + ` [CoordinateGraphSVG: points=${pts}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
                      >
                        📈 Coordinate Graph
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const eq = prompt("Enter parabola equation (e.g. y = x²):", "y = x²");
                          if (eq) setForm(f => ({ ...f, question: f.question + ` [ParabolaSVG: equation=${eq}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontWeight: "600" }}
                      >
                        ∪ Parabola
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const eq = prompt("Enter hyperbola equation (e.g. x²/a² - y²/b² = 1):", "x²/a² - y²/b² = 1");
                          if (eq) setForm(f => ({ ...f, question: f.question + ` [HyperbolaSVG: equation=${eq}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #ddd6fe", background: "#f5f3ff", color: "#8b5cf6", cursor: "pointer", fontWeight: "600" }}
                      >
                        )( Hyperbola
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const lbl = prompt("Enter quadrilateral label corners (e.g. ABCD):", "ABCD");
                          if (lbl) setForm(f => ({ ...f, question: f.question + ` [QuadrilateralSVG: label=${lbl}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #bfdbfe", background: "#eff6ff", color: "#3b82f6", cursor: "pointer", fontWeight: "600" }}
                      >
                        ⬦ Quadrilateral
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d1 = prompt("Enter diagonal 1 length (e.g. 8 cm):", "8 cm");
                          if (!d1) return;
                          const d2 = prompt("Enter diagonal 2 length (e.g. 6 cm):", "6 cm");
                          if (d2) setForm(f => ({ ...f, question: f.question + ` [RhombusSVG: d1=${d1}&d2=${d2}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #fed7aa", background: "#fff7ed", color: "#f97316", cursor: "pointer", fontWeight: "600" }}
                      >
                        ♢ Rhombus
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const b = prompt("Enter base (e.g. 8 cm):", "8 cm");
                          if (!b) return;
                          const h = prompt("Enter height (e.g. 5 cm):", "5 cm");
                          if (h) setForm(f => ({ ...f, question: f.question + ` [ParallelogramSVG: base=${b}&height=${h}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #99f6e4", background: "#f0fdfa", color: "#0d9488", cursor: "pointer", fontWeight: "600" }}
                      >
                        ▰ Parallelogram
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const a = prompt("Enter top base a (e.g. 4 cm):", "4 cm");
                          if (!a) return;
                          const b = prompt("Enter bottom base b (e.g. 8 cm):", "8 cm");
                          if (!b) return;
                          const h = prompt("Enter height h (e.g. 5 cm):", "5 cm");
                          if (h) setForm(f => ({ ...f, question: f.question + ` [TrapeziumSVG: a=${a}&b=${b}&h=${h}]` }));
                        }}
                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid #fecdd3", background: "#fff1f2", color: "#e11d48", cursor: "pointer", fontWeight: "600" }}
                      >
                        ⏢ Trapezium
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="aq-textarea"
                    placeholder="Type the question here… (Click diagram buttons above to add shapes)"
                    value={form.question}
                    onChange={e => setForm(f=>({...f, question:e.target.value}))}
                    rows={3}
                    required
                  />
                </div>

                {/* Options */}
                <div className="aq-field">
                  <label className="aq-label">Options <span style={{color:"#94a3b8",fontWeight:400}}>— select the correct answer</span></label>
                  {form.options.map((opt, i) => (
                    <div key={i} className={`aq-option-row ${form.correctAnswerIndex === i ? 'correct' : ''}`}>
                      <button
                        type="button"
                        className={`aq-opt-radio ${form.correctAnswerIndex === i ? 'selected' : ''}`}
                        onClick={() => setForm(f=>({...f, correctAnswerIndex:i}))}
                        title="Mark as correct"
                        aria-label={`Mark option ${String.fromCharCode(65+i)} as correct`}
                      >
                        {form.correctAnswerIndex === i ? "✓" : String.fromCharCode(65+i)}
                      </button>
                      <input
                        className="aq-input"
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65+i)}`}
                        value={opt}
                        onChange={e => setOpt(i, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="aq-field">
                  <label className="aq-label">Explanation <span style={{color:"#94a3b8",fontWeight:400}}>(optional)</span></label>
                  <textarea
                    className="aq-textarea"
                    placeholder="Explain why the correct answer is right…"
                    value={form.explanation}
                    onChange={e => setForm(f=>({...f, explanation:e.target.value}))}
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="aq-form-actions">
                  <button
                    type="button"
                    className="aq-btn preview"
                    onClick={() => setShowPreview(p => !p)}
                  >
                    {showPreview ? "🙈 Hide Preview" : "👁 Preview"}
                  </button>
                  <button type="submit" className="aq-btn primary" disabled={saving}>
                    {saving ? "Saving…" : editingId ? "💾 Save Changes" : "✅ Add Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Right: Preview ── */}
          {showPreview && (
            <div className="aq-preview-col">
              <QuestionPreview form={form} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
