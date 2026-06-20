import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

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

const renderFormattedText = (text) => {
  if (!text) return "";
  const regex = /\^(\(([^)]+)\)|([a-zA-Z0-9+-]+))/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const exponent = match[2] || match[3];
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    parts.push(<sup key={matchIndex}>{exponent}</sup>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts;
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
    <filter id="svg-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="1" dy="2" stdDeviation="3" floodOpacity="0.15" />
    </filter>
  );

  switch (shape) {
    case "circle": {
      const radius = params.radius || "r";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <radialGradient id="circleGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <circle cx="110" cy="110" r="75" stroke="#0284c7" strokeWidth="3" fill="url(#circleGrad)" filter="url(#svg-shadow)" />
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
            <radialGradient id="semiGrad" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef3c7" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <path d="M 35,130 A 75,75 0 0,1 185,130 Z" stroke="#d97706" strokeWidth="3" fill="url(#semiGrad)" filter="url(#svg-shadow)" />
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
            <linearGradient id="squareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdf4" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <rect x="50" y="50" width="120" height="120" stroke="#16a34a" strokeWidth="3" fill="url(#squareGrad)" filter="url(#svg-shadow)" />
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
            <linearGradient id="rectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#faf5ff" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <rect x="40" y="65" width="140" height="90" stroke="#7c3aed" strokeWidth="3" fill="url(#rectGrad)" filter="url(#svg-shadow)" />
          <text x="110" y="176" fontSize="13" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="middle">w = {width}</text>
          <text x="188" y="114" fontSize="13" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="start">h = {height}</text>
        </svg>
      );
    }
    case "triangle": {
      const a = params.a;
      const b = params.b;
      const c = params.c || params.base;
      const h = params.height || params.h;
      const angA = params.anga || params.angA || params.a_angle;
      const angB = params.angb || params.angB || params.b_angle;
      const angC = params.angc || params.angC || params.c_angle;

      const parseAngle = (val) => {
        if (!val) return null;
        const num = parseInt(val.replace(/[^\d]/g, ""));
        return isNaN(num) ? null : num;
      };

      const aNum = parseAngle(angA);
      const bNum = parseAngle(angB);
      const cNum = parseAngle(angC);

      let ptA = { x: 110, y: 65 };
      let ptB = { x: 40, y: 155 };
      let ptC = { x: 180, y: 155 };
      let showRightAngle = null;

      if (bNum === 90) {
        ptA = { x: 50, y: 65 };
        ptB = { x: 50, y: 155 };
        ptC = { x: 170, y: 155 };
        showRightAngle = 'B';
      } else if (cNum === 90) {
        ptA = { x: 170, y: 65 };
        ptB = { x: 50, y: 155 };
        ptC = { x: 170, y: 155 };
        showRightAngle = 'C';
      } else if (aNum === 90) {
        ptA = { x: 110, y: 95 };
        ptB = { x: 50, y: 155 };
        ptC = { x: 170, y: 155 };
        showRightAngle = 'A';
      } else if (bNum > 90) {
        ptA = { x: 45, y: 65 };
        ptB = { x: 95, y: 155 };
        ptC = { x: 175, y: 155 };
      } else if (cNum > 90) {
        ptA = { x: 175, y: 65 };
        ptB = { x: 45, y: 155 };
        ptC = { x: 125, y: 155 };
      } else if (h) {
        ptA = { x: 110, y: 65 };
        ptB = { x: 40, y: 155 };
        ptC = { x: 180, y: 155 };
        showRightAngle = 'height';
      }

      // Calculate label offsets based on shape coordinates
      const labelB = { x: ptB.x + (showRightAngle === 'B' ? 22 : 12), y: ptB.y - (showRightAngle === 'B' ? 12 : 6) };
      const labelC = { x: ptC.x - (showRightAngle === 'C' ? 22 : 12), y: ptC.y - (showRightAngle === 'C' ? 12 : 6) };
      const labelA = { x: ptA.x, y: ptA.y + (showRightAngle === 'A' ? 26 : 22) };

      const sideLabelC = { x: (ptB.x + ptC.x) / 2, y: ptB.y + 18 };
      const sideLabelB = { x: (ptA.x + ptB.x) / 2 - 15, y: (ptA.y + ptB.y) / 2 };
      const sideLabelA = { x: (ptA.x + ptC.x) / 2 + 15, y: (ptA.y + ptC.y) / 2 };

      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef2f2" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points={`${ptB.x},${ptB.y} ${ptC.x},${ptC.y} ${ptA.x},${ptA.y}`} stroke="#dc2626" strokeWidth="3" fill="url(#triGrad)" filter="url(#svg-shadow)" />
          
          {showRightAngle === 'height' && (
            <>
              <line x1="110" y1="65" x2="110" y2="155" stroke="#b91c1c" strokeWidth="1.5" strokeDasharray="3 3" />
              <rect x="110" y="145" width="10" height="10" fill="none" stroke="#b91c1c" strokeWidth="1.2" />
              <text x="120" y="115" fontSize="12" fill="#b91c1c" fontWeight="700" fontFamily="system-ui" textAnchor="start">h = {h}</text>
            </>
          )}

          {showRightAngle === 'B' && (
            <path d={`M ${ptB.x},${ptB.y - 12} L ${ptB.x + 12},${ptB.y - 12} L ${ptB.x + 12},${ptB.y}`} fill="none" stroke="#dc2626" strokeWidth="1.5" />
          )}

          {showRightAngle === 'C' && (
            <path d={`M ${ptC.x},${ptC.y - 12} L ${ptC.x - 12},${ptC.y - 12} L ${ptC.x - 12},${ptC.y}`} fill="none" stroke="#dc2626" strokeWidth="1.5" />
          )}

          {showRightAngle === 'A' && (
            <path d={`M ${ptA.x - 8},${ptA.y + 8} L ${ptA.x},${ptA.y + 16} L ${ptA.x + 8},${ptA.y + 8}`} fill="none" stroke="#dc2626" strokeWidth="1.5" />
          )}

          {/* Side Labels */}
          {c && <text x={sideLabelC.x} y={sideLabelC.y} fontSize="12" fill="#b91c1c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{c}</text>}
          {b && <text x={sideLabelB.x} y={sideLabelB.y} fontSize="12" fill="#b91c1c" fontWeight="700" fontFamily="system-ui" textAnchor="end">{b}</text>}
          {a && <text x={sideLabelA.x} y={sideLabelA.y} fontSize="12" fill="#b91c1c" fontWeight="700" fontFamily="system-ui" textAnchor="start">{a}</text>}

          {/* Angle Labels */}
          {angA && <text x={labelA.x} y={labelA.y} fontSize="11" fill="#7f1d1d" fontWeight="600" fontFamily="system-ui" textAnchor="middle">{angA}</text>}
          {angB && <text x={labelB.x} y={labelB.y} fontSize="11" fill="#7f1d1d" fontWeight="600" fontFamily="system-ui" textAnchor="start">{angB}</text>}
          {angC && <text x={labelC.x} y={labelC.y} fontSize="11" fill="#7f1d1d" fontWeight="600" fontFamily="system-ui" textAnchor="end">{angC}</text>}
        </svg>
      );
    }
    case "concentriccircles": {
      const r1 = params.r1 || "r₁";
      const r2 = params.r2 || "r₂";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <radialGradient id="conc1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ecfeff" />
            </radialGradient>
            <radialGradient id="conc2" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#f0f9ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <circle cx="110" cy="110" r="75" stroke="#0284c7" strokeWidth="2.5" fill="url(#conc2)" filter="url(#svg-shadow)" />
          <circle cx="110" cy="110" r="45" stroke="#0891b2" strokeWidth="2.5" fill="url(#conc1)" />
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
          <g filter="url(#svg-shadow)">
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
            <radialGradient id="ellGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#faf5ff" />
            </radialGradient>
            {shadowFilter}
          </defs>
          <ellipse cx="110" cy="110" rx="75" ry="45" stroke="#7c3aed" strokeWidth="3" fill="url(#ellGrad)" filter="url(#svg-shadow)" />
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
            <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdf4" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points={points.join(" ")} stroke="#16a34a" strokeWidth="3" fill="url(#polyGrad)" filter="url(#svg-shadow)" />
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
        const pathData = `M 85,110 L ${x1},${y1} A 55,55 0 ${largeArcFlag},1 ${x2},${y2} Z`;
        
        return (
          <path
            key={i}
            d={pathData}
            fill={colors[i % colors.length]}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        );
      });
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>{shadowFilter}</defs>
          <g filter="url(#svg-shadow)">
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
          <path d="M 40,65 Q 110,185 180,65" stroke="#ef4444" strokeWidth="3" fill="none" filter="url(#svg-shadow)" />
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
          <path d="M 45,55 Q 95,110 45,165" stroke="#8b5cf6" strokeWidth="3" fill="none" filter="url(#svg-shadow)" />
          <path d="M 175,55 Q 125,110 175,165" stroke="#8b5cf6" strokeWidth="3" fill="none" filter="url(#svg-shadow)" />
          <text x="110" y="38" fontSize="12" fill="#6d28d9" fontWeight="700" fontFamily="system-ui" textAnchor="middle">{eq}</text>
        </svg>
      );
    }
    case "quadrilateral": {
      const lbl = params.label || "ABCD";
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
          <defs>
            <linearGradient id="quadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="50,75 160,60 175,150 65,165" stroke="#2563eb" strokeWidth="3" fill="url(#quadGrad)" filter="url(#svg-shadow)" />
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
            <linearGradient id="rhomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff7ed" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="110,45 175,110 110,175 45,110" stroke="#ea580c" strokeWidth="3" fill="url(#rhomGrad)" filter="url(#svg-shadow)" />
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
            <linearGradient id="paraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdfa" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="65,70 185,70 155,150 35,150" stroke="#0d9488" strokeWidth="3" fill="url(#paraGrad)" filter="url(#svg-shadow)" />
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
            <linearGradient id="trapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff1f2" />
            </linearGradient>
            {shadowFilter}
          </defs>
          <polygon points="75,70 145,70 185,150 35,150" stroke="#e11d48" strokeWidth="3" fill="url(#trapGrad)" filter="url(#svg-shadow)" />
          <line x1="75" y1="70" x2="75" y2="150" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="75" y="140" width="10" height="10" fill="none" stroke="#e11d48" strokeWidth="1.2" />
          <text x="110" y="62" fontSize="12" fill="#be123c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">a = {a}</text>
          <text x="110" y="166" fontSize="12" fill="#be123c" fontWeight="700" fontFamily="system-ui" textAnchor="middle">b = {b}</text>
          <text x="85" y="115" fontSize="12" fill="#be123c" fontWeight="700" fontFamily="system-ui">h = {h}</text>
        </svg>
      );
    }
    case "touchingcircles": {
      const type = params.type || "external";
      const r1 = params.r1 || "r₁";
      const r2 = params.r2 || "r₂";

      const parseVal = (val) => {
        if (!val) return null;
        const match = val.toString().replace(/,/g, "").match(/^[\d\.]+/);
        return match ? parseFloat(match[0]) : null;
      };

      const v1 = parseVal(r1);
      const v2 = parseVal(r2);

      if (type === "internal") {
        let R1_val = 75;
        let R2_val = 45;
        let cx1 = 110;
        let cx2 = 140;

        if (v1 !== null && v2 !== null && v1 > 0 && v2 > 0) {
          if (v1 >= v2) {
            R1_val = 75;
            R2_val = 75 * (v2 / v1);
            cx1 = 110;
            cx2 = 110 + R1_val - R2_val;
          } else {
            R2_val = 75;
            R1_val = 75 * (v1 / v2);
            cx2 = 110;
            cx1 = 110 + R2_val - R1_val;
          }
        }

        const outerIs1 = R1_val >= R2_val;
        const outerCx = outerIs1 ? cx1 : cx2;
        const outerR = outerIs1 ? R1_val : R2_val;
        const innerCx = outerIs1 ? cx2 : cx1;
        const innerR = outerIs1 ? R2_val : R1_val;

        return (
          <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
            <defs>
              <radialGradient id="touchInt1" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#f0f9ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </radialGradient>
              <radialGradient id="touchInt2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ecfeff" />
              </radialGradient>
              {shadowFilter}
            </defs>
            <circle cx={outerCx} cy="110" r={outerR} stroke="#0284c7" strokeWidth="2.5" fill="url(#touchInt1)" filter="url(#svg-shadow)" />
            <circle cx={innerCx} cy="110" r={innerR} stroke="#0891b2" strokeWidth="2" fill="url(#touchInt2)" />
            <circle cx={cx1} cy="110" r="3.5" fill="#0369a1" />
            <circle cx={cx2} cy="110" r="3.5" fill="#0891b2" />
            <line x1={outerCx} y1="110" x2={outerCx + outerR} y2="110" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={innerCx} y1="110" x2={innerCx} y2={110 + innerR} stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx1 - 4} y="102" fontSize="10" fill="#0369a1" fontWeight="bold" fontFamily="system-ui">O₁</text>
            <text x={cx2 - 4} y="102" fontSize="10" fill="#0891b2" fontWeight="bold" fontFamily="system-ui">O₂</text>
            <text x={outerCx + outerR * 0.7} y="104" fontSize="10" fill="#0369a1" fontWeight="700" fontFamily="system-ui" textAnchor="middle">r₁={r1}</text>
            <text x={innerCx + 5} y={110 + innerR * 0.6} fontSize="10" fill="#0891b2" fontWeight="700" fontFamily="system-ui" textAnchor="start">r₂={r2}</text>
          </svg>
        );
      } else {
        let R1_val = 50;
        let R2_val = 30;
        let cx1 = 75;
        let cx2 = 155;

        if (v1 !== null && v2 !== null && v1 > 0 && v2 > 0) {
          const scale = 80 / (v1 + v2);
          R1_val = v1 * scale;
          R2_val = v2 * scale;
          cx1 = 110 - R2_val;
          cx2 = 110 + R1_val;
        }

        return (
          <svg width="220" height="220" viewBox="0 0 220 220" style={containerStyle}>
            <defs>
              <radialGradient id="touchExt1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </radialGradient>
              <radialGradient id="touchExt2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ecfeff" />
              </radialGradient>
              {shadowFilter}
            </defs>
            <circle cx={cx1} cy="110" r={R1_val} stroke="#0284c7" strokeWidth="2.5" fill="url(#touchExt1)" filter="url(#svg-shadow)" />
            <circle cx={cx2} cy="110" r={R2_val} stroke="#0891b2" strokeWidth="2.5" fill="url(#touchExt2)" filter="url(#svg-shadow)" />
            <circle cx={cx1} cy="110" r="3.5" fill="#0369a1" />
            <circle cx={cx2} cy="110" r="3.5" fill="#0891b2" />
            <line x1={cx1} y1="110" x2={cx2} y2="110" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx1} y="102" fontSize="10" fill="#0369a1" fontWeight="bold" fontFamily="system-ui" textAnchor="middle">O₁</text>
            <text x={cx2} y="102" fontSize="10" fill="#0891b2" fontWeight="bold" fontFamily="system-ui" textAnchor="middle">O₂</text>
            <text x={cx1 + R1_val / 2} y="122" fontSize="10" fill="#0369a1" fontWeight="700" fontFamily="system-ui" textAnchor="middle">r₁={r1}</text>
            <text x={cx2 - R2_val / 2} y="122" fontSize="10" fill="#0891b2" fontWeight="700" fontFamily="system-ui" textAnchor="middle">r₂={r2}</text>
          </svg>
        );
      }
    }
    default:
      return null;
  }
}

function renderQuestionText(questionText) {
  if (!questionText) return null;

  const regex = /\[(Circle|Semicircle|Square|Rectangle|Triangle|ConcentricCircles|Venn|Ellipse|Polygon|PieChart|NumberLine|CoordinateGraph|Parabola|Hyperbola|Quadrilateral|Rhombus|Parallelogram|Trapezium|TouchingCircles)SVG:\s*([^\]]+)\]/gi;
  const matches = [...questionText.matchAll(regex)];

  if (matches.length === 0) {
    return (
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>
        {renderFormattedText(questionText)}
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
        <span key={`text-pre-${index}`} style={{ fontSize: "18px", fontWeight: "bold" }}>
          {renderFormattedText(questionText.substring(lastIndex, matchIndex))}
        </span>
      );
    }

    elements.push(
      <div 
        key={`diagram-${index}`} 
        style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}
      >
        {renderDiagramSvg(shape, params)}
      </div>
    );

    lastIndex = matchIndex + match[0].length;
  });

  if (lastIndex < questionText.length) {
    elements.push(
      <span key="text-post" style={{ fontSize: "18px", fontWeight: "bold" }}>
        {renderFormattedText(questionText.substring(lastIndex))}
      </span>
    );
  }

  return <div style={{ marginBottom: "15px" }}>{elements}</div>;
}

const COMPONENT_DIMENSIONS = {
  SWITCH: { w: 80, h: 40 },
  CLOCK: { w: 80, h: 40 },
  CONST0: { w: 70, h: 36 },
  CONST1: { w: 70, h: 36 },
  AND: { w: 90, h: 60 },
  OR: { w: 90, h: 60 },
  NOT: { w: 70, h: 50 },
  XOR: { w: 90, h: 60 },
  XNOR: { w: 90, h: 60 },
  NAND: { w: 90, h: 60 },
  NOR: { w: 90, h: 60 },
  LED: { w: 60, h: 60 },
  BULB: { w: 60, h: 70 },
  SEVENSEG: { w: 80, h: 100 },
  SR_FF: { w: 100, h: 100 },
  JK_FF: { w: 100, h: 100 },
  D_FF: { w: 100, h: 100 },
  HALF_ADDER: { w: 90, h: 80 },
  FULL_ADDER: { w: 100, h: 100 },
  COMPARATOR: { w: 90, h: 90 },
  ALU: { w: 120, h: 120 },
  MUX: { w: 90, h: 100 },
  DEC: { w: 90, h: 100 }
};

const getNodeSize = (node) => {
  const config = COMPONENT_DIMENSIONS[node.type] || { w: 80, h: 60 };
  const w = node.width || config.w;
  let h = node.height || config.h;
  if (["AND", "OR", "NAND", "NOR", "XOR", "XNOR"].includes(node.type)) {
    const inputs = node.inputsCount || 2;
    if (inputs > 3) {
      h = Math.max(60, inputs * 18);
    }
  }
  return { w, h };
};

const getPortCoords = (node, portName, isInput) => {
  const { w, h } = getNodeSize(node);
  let rx = w / 2;
  let ry = h / 2;

  if (isInput) {
    if (node.type === "NOT" || node.type === "LED" || node.type === "BULB") {
      rx = 0; ry = h / 2;
    } else if (node.type === "SEVENSEG") {
      const ports = { IN_A: 15, IN_B: 35, IN_C: 55, IN_D: 75 };
      rx = 0; ry = ports[portName] || h / 2;
    } else if (node.type === "HALF_ADDER" || node.type === "COMPARATOR") {
      const ports = { A: h / 3, B: (h / 3) * 2 };
      rx = 0; ry = ports[portName] || h / 2;
    } else if (node.type === "FULL_ADDER") {
      const ports = { A: h / 4, B: (h / 4) * 2, CIN: (h / 4) * 3 };
      rx = 0; ry = ports[portName] || h / 2;
    } else if (node.type === "D_FF") {
      const ports = { D: 30, CLK: 70 };
      rx = 0; ry = ports[portName] || h / 2;
    } else if (node.type === "JK_FF" || node.type === "SR_FF") {
      const ports = { J: 25, S: 25, CLK: 50, K: 75, R: 75 };
      rx = 0; ry = ports[portName] || h / 2;
    } else if (node.type === "ALU") {
      const ports = { A0: 20, A1: 40, B0: 60, B1: 80, OP: 100 };
      rx = 0; ry = ports[portName] || h / 2;
    } else if (node.type === "MUX") {
      const ports = { D0: 25, D1: 50, SEL: 75 };
      rx = 0; ry = ports[portName] || h / 2;
    } else if (node.type === "DEC") {
      const ports = { A: 35, B: 65 };
      rx = 0; ry = ports[portName] || h / 2;
    } else {
      const count = node.inputsCount || 2;
      const pinIdx = Number(portName.replace("IN_", ""));
      if (!isNaN(pinIdx)) ry = (pinIdx + 1) * (h / (count + 1));
      else ry = h / 2;
      rx = 0;
    }
  } else {
    if (node.type === "SR_FF" || node.type === "JK_FF" || node.type === "D_FF") {
      const ports = { Q: 25, QB: 75 };
      rx = w; ry = ports[portName] || h / 2;
    } else if (node.type === "HALF_ADDER" || node.type === "FULL_ADDER") {
      const ports = { SUM: h / 3, CARRY: (h / 3) * 2, COUT: (h / 3) * 2 };
      rx = w; ry = ports[portName] || h / 2;
    } else if (node.type === "COMPARATOR") {
      const ports = { GT: h / 4, EQ: h / 2, LT: (h / 4) * 3 };
      rx = w; ry = ports[portName] || h / 2;
    } else if (node.type === "ALU") {
      const ports = { Y0: 30, Y1: 60, Y2: 90 };
      rx = w; ry = ports[portName] || h / 2;
    } else if (node.type === "DEC") {
      const ports = { Y0: 20, Y1: 40, Y2: 60, Y3: 80 };
      rx = w; ry = ports[portName] || h / 2;
    } else {
      rx = w; ry = h / 2;
    }
  }

  // Rotation
  let fx = node.x + rx;
  let fy = node.y + ry;
  if (node.rotation === 90) {
    const dx = rx - w / 2; const dy = ry - h / 2;
    fx = node.x + w / 2 - dy; fy = node.y + h / 2 + dx;
  } else if (node.rotation === 180) {
    fx = node.x + (w - rx); fy = node.y + (h - ry);
  } else if (node.rotation === 270) {
    const dx = rx - w / 2; const dy = ry - h / 2;
    fx = node.x + w / 2 + dy; fy = node.y + h / 2 - dx;
  }
  return { x: fx, y: fy };
};

const solveLogic = (currentNodes, currentWires) => {
  let solved = currentNodes.map(n => ({ ...n, inputValues: {}, prevClockVal: n.inputValues?.CLK }));
  solved.forEach(node => { node.inputValues = {}; });

  for (let cycle = 0; cycle < 6; cycle++) {
    currentWires.forEach(wire => {
      const src = solved.find(n => n.id === wire.fromNode);
      const tgt = solved.find(n => n.id === wire.toNode);
      if (src && tgt) {
        let val = 0;
        if (src.type.includes("FF") || src.type === "HALF_ADDER" || src.type === "FULL_ADDER" || src.type === "COMPARATOR" || src.type === "ALU" || src.type === "DEC") {
          val = src.outputs?.[wire.fromPort] || 0;
        } else {
          val = src.state || 0;
        }
        tgt.inputValues[wire.toPort] = val;
      }
    });

    solved = solved.map(node => {
      const getIn = (port, fallback = 0) => (node.inputValues[port] !== undefined ? node.inputValues[port] : fallback);

      switch (node.type) {
        case "SWITCH":
        case "CLOCK":
        case "CONST0":
        case "CONST1":
          break;
        case "NOT":
          node.state = getIn("IN") === 1 ? 0 : 1;
          break;
        case "AND": {
          const cnt = node.inputsCount || 2;
          const ins = []; for (let i=0; i<cnt; i++) ins.push(getIn(`IN_${i}`));
          node.state = ins.every(v => v === 1) ? 1 : 0;
          break;
        }
        case "OR": {
          const cnt = node.inputsCount || 2;
          const ins = []; for (let i=0; i<cnt; i++) ins.push(getIn(`IN_${i}`));
          node.state = ins.some(v => v === 1) ? 1 : 0;
          break;
        }
        case "NAND": {
          const cnt = node.inputsCount || 2;
          const ins = []; for (let i=0; i<cnt; i++) ins.push(getIn(`IN_${i}`));
          node.state = ins.every(v => v === 1) ? 0 : 1;
          break;
        }
        case "NOR": {
          const cnt = node.inputsCount || 2;
          const ins = []; for (let i=0; i<cnt; i++) ins.push(getIn(`IN_${i}`));
          node.state = ins.some(v => v === 1) ? 0 : 1;
          break;
        }
        case "XOR": {
          const cnt = node.inputsCount || 2;
          const ins = []; for (let i=0; i<cnt; i++) ins.push(getIn(`IN_${i}`));
          node.state = ins.filter(v => v === 1).length % 2 === 1 ? 1 : 0;
          break;
        }
        case "XNOR": {
          const cnt = node.inputsCount || 2;
          const ins = []; for (let i=0; i<cnt; i++) ins.push(getIn(`IN_${i}`));
          node.state = ins.filter(v => v === 1).length % 2 === 0 ? 1 : 0;
          break;
        }
        case "LED":
        case "BULB":
          node.state = getIn("IN");
          break;
        case "SEVENSEG": {
          const decimalVal = (getIn("IN_A") * 8) + (getIn("IN_B") * 4) + (getIn("IN_C") * 2) + getIn("IN_D");
          node.state = decimalVal;
          break;
        }
        case "HALF_ADDER":
          node.outputs = { SUM: getIn("A") ^ getIn("B"), CARRY: getIn("A") & getIn("B") };
          break;
        case "FULL_ADDER": {
          const sum = getIn("A") ^ getIn("B") ^ getIn("CIN");
          const cout = (getIn("A") & getIn("B")) | (getIn("B") & getIn("CIN")) | (getIn("A") & getIn("CIN"));
          node.outputs = { SUM: sum, COUT: cout };
          break;
        }
        case "COMPARATOR": {
          const a = getIn("A"); const b = getIn("B");
          node.outputs = { LT: a < b ? 1 : 0, EQ: a === b ? 1 : 0, GT: a > b ? 1 : 0 };
          break;
        }
        case "D_FF": {
          const prev = node.outputs?.Q || 0;
          let Q = prev;
          if (node.prevClockVal === 0 && getIn("CLK") === 1) Q = getIn("D");
          node.outputs = { Q, QB: Q === 1 ? 0 : 1 };
          break;
        }
        case "JK_FF": {
          const prev = node.outputs?.Q || 0;
          let Q = prev;
          if (node.prevClockVal === 0 && getIn("CLK") === 1) {
            const j = getIn("J"), k = getIn("K");
            if (j === 0 && k === 1) Q = 0;
            else if (j === 1 && k === 0) Q = 1;
            else if (j === 1 && k === 1) Q = prev === 1 ? 0 : 1;
          }
          node.outputs = { Q, QB: Q === 1 ? 0 : 1 };
          break;
        }
        case "SR_FF": {
          const prev = node.outputs?.Q || 0;
          let Q = prev;
          if (node.prevClockVal === 0 && getIn("CLK") === 1) {
            const s = getIn("S"), r = getIn("R");
            if (s === 1 && r === 0) Q = 1;
            else if (s === 0 && r === 1) Q = 0;
          }
          node.outputs = { Q, QB: Q === 1 ? 0 : 1 };
          break;
        }
        case "ALU": {
          const valA = (getIn("A1") * 2) + getIn("A0");
          const valB = (getIn("B1") * 2) + getIn("B0");
          const res = getIn("OP") === 0 ? (valA + valB) : (valA & valB);
          node.outputs = { Y0: res & 1, Y1: (res >> 1) & 1, Y2: (res >> 2) & 1 };
          break;
        }
        case "MUX":
          node.state = getIn("SEL") === 1 ? getIn("D1") : getIn("D0");
          break;
        case "DEC": {
          const val = (getIn("A") * 2) + getIn("B");
          node.outputs = { Y0: val === 0 ? 1 : 0, Y1: val === 1 ? 1 : 0, Y2: val === 2 ? 1 : 0, Y3: val === 3 ? 1 : 0 };
          break;
        }
      }
      return node;
    });
  }
  return solved;
};

function StudentCircuitSandbox({ circuitData }) {
  const [nodes, setNodes] = useState([]);
  const [wires, setWires] = useState([]);
  const [simulating, setSimulating] = useState(true);

  // Initialize data
  useEffect(() => {
    try {
      const parsed = JSON.parse(circuitData);
      if (parsed.nodes && parsed.wires) {
        setNodes(solveLogic(parsed.nodes, parsed.wires));
        setWires(parsed.wires);
      }
    } catch (e) {}
  }, [circuitData]);

  // Clock ticks
  useEffect(() => {
    let timer;
    if (simulating) {
      timer = setInterval(() => {
        const now = Date.now();
        setNodes(prev => {
          let clockToggled = false;
          const nextNodes = prev.map(n => {
            if (n.type === "CLOCK") {
              const state = Math.floor(now / 500) % 2;
              if (n.state !== state) { clockToggled = true; return { ...n, state }; }
            }
            return n;
          });
          return clockToggled ? solveLogic(nextNodes, wires) : prev;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [simulating, wires]);

  const toggleSwitch = (id) => {
    setNodes(prev => solveLogic(
      prev.map(n => n.id === id ? { ...n, state: n.state === 1 ? 0 : 1 } : n),
      wires
    ));
  };

  const getWireRoute = (wire) => {
    const fromNode = nodes.find(n => n.id === wire.fromNode);
    const toNode = nodes.find(n => n.id === wire.toNode);
    if (!fromNode || !toNode) return "";

    const start = getPortCoords(fromNode, wire.fromPort, false);
    const end = getPortCoords(toNode, wire.toPort, true);
    
    // Fall back to simple orthogonal path for compactness
    const midX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  };

  if (nodes.length === 0) return null;

  // Render SSD segments helper
  const renderSevenSegSegments = (node) => {
    const val = node.state || 0;
    const segs = {
      0: [1,1,1,1,1,1,0], 1: [0,1,1,0,0,0,0], 2: [1,1,0,1,1,0,1], 3: [1,1,1,1,0,0,1],
      4: [0,1,1,0,0,1,1], 5: [1,0,1,1,0,1,1], 6: [1,0,1,1,1,1,1], 7: [1,1,1,0,0,0,0],
      8: [1,1,1,1,1,1,1], 9: [1,1,1,1,0,1,1], 10: [1,1,1,0,1,1,1], 11: [0,0,1,1,1,1,1],
      12: [1,0,0,1,1,1,0], 13: [0,1,1,1,1,0,1], 14: [1,0,0,1,1,1,1], 15: [1,0,0,0,1,1,1]
    };
    const active = segs[val] || [0,0,0,0,0,0,0];
    return (
      <g transform="translate(25, 20)">
        <rect x="5" y="0" width="20" height="4" rx="2" fill={active[0] ? "#ef4444" : "#334155"} />
        <rect x="23" y="3" width="4" height="20" rx="2" fill={active[1] ? "#ef4444" : "#334155"} />
        <rect x="23" y="25" width="4" height="20" rx="2" fill={active[2] ? "#ef4444" : "#334155"} />
        <rect x="5" y="44" width="20" height="4" rx="2" fill={active[3] ? "#ef4444" : "#334155"} />
        <rect x="2" y="25" width="4" height="20" rx="2" fill={active[4] ? "#ef4444" : "#334155"} />
        <rect x="2" y="3" width="4" height="20" rx="2" fill={active[5] ? "#ef4444" : "#334155"} />
        <rect x="5" y="22" width="20" height="4" rx="2" fill={active[6] ? "#ef4444" : "#334155"} />
      </g>
    );
  };

  // Find circuit bounding box to fit dynamically inside the card viewport
  const nodeSizes = nodes.map(n => {
    const size = getNodeSize(n) || { w: 80, h: 60 };
    return {
      minX: n.x,
      minY: n.y,
      maxX: n.x + size.w,
      maxY: n.y + size.h
    };
  });

  const minX = nodes.length > 0 ? Math.min(...nodeSizes.map(n => n.minX)) : 0;
  const minY = nodes.length > 0 ? Math.min(...nodeSizes.map(n => n.minY)) : 0;
  const maxX = nodes.length > 0 ? Math.max(...nodeSizes.map(n => n.maxX)) : 800;
  const maxY = nodes.length > 0 ? Math.max(...nodeSizes.map(n => n.maxY)) : 400;

  const padding = 45;
  const viewBoxX = minX - padding;
  const viewBoxY = minY - padding;
  const viewBoxW = Math.max(maxX - minX + padding * 2, 100);
  const viewBoxH = Math.max(maxY - minY + padding * 2, 100);

  return (
    <div style={{ margin: "16px 0", background: "#0b0f19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
          ⚡ Interactive Circuit Sandbox
        </span>
        <button
          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", background: simulating ? "#10b981" : "rgba(255,255,255,0.08)", border: "none", color: "white", fontSize: "10px", fontWeight: "600", borderRadius: "4px", cursor: "pointer" }}
          onClick={() => setSimulating(s => !s)}
        >
          {simulating ? <Pause size={10} /> : <Play size={10} />}
          {simulating ? "Sim Active" : "Run Simulation"}
        </button>
      </div>

      <div style={{ height: "300px", position: "relative" }}>
        <svg 
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`} 
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <style>{`
            @keyframes pulse-dash {
              to {
                stroke-dashoffset: -32;
              }
            }
          `}</style>
          <defs>
            <pattern id="card-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect x={viewBoxX} y={viewBoxY} width={viewBoxW} height={viewBoxH} fill="url(#card-grid)" />

          <g>
            {wires.map(wire => {
              const src = nodes.find(n => n.id === wire.fromNode);
              let active = 0;
              if (src) {
                active = src.type.includes("FF") || src.type === "HALF_ADDER" || src.type === "FULL_ADDER" || src.type === "COMPARATOR" || src.type === "ALU" || src.type === "DEC"
                  ? src.outputs?.[wire.fromPort] || 0
                  : src.state || 0;
              }
              const route = getWireRoute(wire);
              return (
                <g key={wire.id}>
                  <path d={route} fill="none" stroke={active === 1 ? "#10b981" : "#1e293b"} strokeWidth={active === 1 ? "3" : "2"} style={{ transition: "stroke 0.2s", filter: active === 1 ? "drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))" : "" }} />
                  {simulating && active === 1 && (
                    <path
                      d={route}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="8 24"
                      style={{
                        animation: "pulse-dash 0.75s infinite linear",
                        filter: "drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 3px #10b981)",
                        pointerEvents: "none"
                      }}
                    />
                  )}
                </g>
              );
            })}

            {nodes.map(node => {
              const { w, h } = getNodeSize(node);
              const color = node.color || "#3b82f6";
              const isSwitch = node.type === "SWITCH";

              const inputs = [];
              if (node.type === "NOT" || node.type === "LED" || node.type === "BULB") inputs.push("IN");
              else if (node.type === "SEVENSEG") inputs.push("IN_A", "IN_B", "IN_C", "IN_D");
              else if (node.type === "HALF_ADDER" || node.type === "COMPARATOR") inputs.push("A", "B");
              else if (node.type === "FULL_ADDER") inputs.push("A", "B", "CIN");
              else if (node.type === "D_FF") inputs.push("D", "CLK");
              else if (node.type === "JK_FF" || node.type === "SR_FF") inputs.push("J", "S", "CLK", "K", "R");
              else if (node.type === "ALU") inputs.push("A0", "A1", "B0", "B1", "OP");
              else if (node.type === "MUX") inputs.push("D0", "D1", "SEL");
              else if (node.type === "DEC") inputs.push("A", "B");
              else if (!["SWITCH", "CLOCK", "CONST0", "CONST1"].includes(node.type)) {
                const count = node.inputsCount || 2;
                for (let i = 0; i < count; i++) inputs.push(`IN_${i}`);
              }

              const outputs = [];
              if (node.type === "SR_FF" || node.type === "JK_FF" || node.type === "D_FF") outputs.push("Q", "QB");
              else if (node.type === "HALF_ADDER" || node.type === "FULL_ADDER") outputs.push("SUM", "CARRY");
              else if (node.type === "COMPARATOR") outputs.push("GT", "EQ", "LT");
              else if (node.type === "ALU") outputs.push("Y0", "Y1", "Y2");
              else if (node.type === "DEC") outputs.push("Y0", "Y1", "Y2", "Y3");
              else if (!["LED", "BULB", "SEVENSEG"].includes(node.type)) outputs.push("OUT");

              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y}) rotate(${node.rotation}, ${w/2}, ${h/2})`}>
                  {(() => {
                    const fill = "#1e293b";
                    const stroke = "#334155";
                    const strokeWidth = "1.5";
                    switch (node.type) {
                      case "AND":
                        return (
                          <>
                            <path d={`M 0 0 L ${w/2} 0 A ${w/2} ${h/2} 0 0 1 ${w/2} ${h} L 0 ${h} Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <rect width="4" height={h} fill={color} rx="1" />
                          </>
                        );
                      case "NAND":
                        return (
                          <>
                            <path d={`M 0 0 L ${(w - 8)/2} 0 A ${(w - 8)/2} ${h/2} 0 0 1 ${(w - 8)/2} ${h} L 0 ${h} Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <circle cx={w - 4} cy={h/2} r="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <rect width="4" height={h} fill={color} rx="1" />
                          </>
                        );
                      case "OR":
                        return (
                          <>
                            <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.6} ${h} ${w} ${h/2} Q ${w*0.6} 0 0 0 Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h}`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                          </>
                        );
                      case "NOR":
                        return (
                          <>
                            <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.55} ${h} ${w - 8} ${h/2} Q ${w*0.55} 0 0 0 Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <circle cx={w - 4} cy={h/2} r="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h}`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                          </>
                        );
                      case "XOR":
                        return (
                          <>
                            <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
                            <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.6} ${h} ${w} ${h/2} Q ${w*0.6} 0 0 0 Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                          </>
                        );
                      case "XNOR":
                        return (
                          <>
                            <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
                            <path d={`M 0 0 Q ${w/4} ${h/2} 0 ${h} Q ${w*0.55} ${h} ${w - 8} ${h/2} Q ${w*0.55} 0 0 0 Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <circle cx={w - 4} cy={h/2} r="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <path d={`M -6 0 Q ${w/4 - 6} ${h/2} -6 ${h}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                          </>
                        );
                      case "NOT":
                        return (
                          <>
                            <path d={`M 0 0 L ${w - 8} ${h/2} L 0 ${h} Z`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <circle cx={w - 4} cy={h/2} r="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                            <rect width="4" height={h} fill={color} rx="1" />
                          </>
                        );
                      default:
                        return (
                          <>
                            <rect fill={fill} stroke={stroke} strokeWidth={strokeWidth} width={w} height={h} rx="4" />
                            <rect width="4" height={h} fill={color} rx="1" />
                          </>
                        );
                    }
                  })()}
                  
                  <text x="8" y="14" fontSize="8" fontWeight="bold" fill="#64748b">{node.type}</text>
                  <text x={w/2} y={node.type === "SEVENSEG" || node.type === "BULB" || node.type === "LED" ? h-6 : h/2+4} fontSize="9" fontWeight="600" fill="#f8fafc" textAnchor="middle">{node.label || node.type}</text>

                  {isSwitch && (
                    <g transform="translate(25, 20)" style={{ cursor: "pointer" }} onClick={() => toggleSwitch(node.id)}>
                      <rect width="30" height="14" rx="7" fill={node.state === 1 ? "#10b981" : "#475569"} />
                      <circle cx={node.state === 1 ? 23 : 7} cy="7" r="5" fill="white" style={{ transition: "all 0.15s" }} />
                    </g>
                  )}

                  {node.type === "LED" && (
                    <circle cx={w/2} cy={h/2-4} r="12" fill={node.state === 1 ? "#10b981" : "#0f172a"} stroke={node.state === 1 ? "#34d399" : "#475569"} strokeWidth="1.5" />
                  )}

                  {node.type === "BULB" && (
                    <path d="M 30,12 C 23,12 18,17 18,24 C 18,29 21,33 24,36 L 24,42 L 36,42 L 36,36 C 39,33 42,29 42,24 C 42,17 37,12 30,12 Z" fill={node.state === 1 ? "#fbbf24" : "#0f172a"} stroke={node.state === 1 ? "#fbbf24" : "#475569"} strokeWidth="1.5" transform="scale(0.8) translate(7, 4)" />
                  )}

                  {node.type === "SEVENSEG" && renderSevenSegSegments(node)}

                  {/* Ports */}
                  {inputs.map(port => {
                    const pos = getPortCoords(node, port, true);
                    const isHigh = node.inputValues?.[port] === 1;
                    return (
                      <circle key={port} cx={pos.x - node.x} cy={pos.y - node.y} r="3" fill={isHigh ? "#10b981" : "#475569"} stroke="#0b0f19" strokeWidth="0.5" />
                    );
                  })}
                  {outputs.map(port => {
                    const pos = getPortCoords(node, port, false);
                    const isHigh = (node.type.includes("FF") || node.type === "HALF_ADDER" || node.type === "FULL_ADDER" || node.type === "COMPARATOR" || node.type === "ALU" || node.type === "DEC" ? node.outputs?.[port] : node.state) === 1;
                    return (
                      <circle key={port} cx={pos.x - node.x} cy={pos.y - node.y} r="3" fill={isHigh ? "#10b981" : "#475569"} stroke="#0b0f19" strokeWidth="0.5" />
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

function QuestionCard({
  questionData,
  questionNumber,
  totalQuestions,
  selectedOption,
  onOptionClick,
  showResult
}) {
  return (
    <div className="card">
      <h3>Question {questionNumber} / {totalQuestions}</h3>

      {renderQuestionText(questionData.question)}

      {questionData.circuitData && (
        <StudentCircuitSandbox circuitData={questionData.circuitData} />
      )}

      {questionData.options.map((option, index) => {
        let backgroundColor = "#f4f4f4"

        if (showResult) {
          if (index === questionData.correctAnswerIndex) {
            backgroundColor = "#90ee90"
          } else if (option === selectedOption) {
            backgroundColor = "#ff7f7f"
          }
        } else if (selectedOption === option) {
          backgroundColor = "#d3d3d3"
        }

        return (
          <button
            key={index}
            onClick={() => onOptionClick(option)}
            className="button"
            style={{ backgroundColor }}
          >
            {renderFormattedText(option)}
          </button>
        )
      })}
    </div>
  )
}

export default QuestionCard