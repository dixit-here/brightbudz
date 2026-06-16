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