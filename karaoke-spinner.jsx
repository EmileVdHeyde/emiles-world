import { useState, useRef, useEffect } from "react";

const songs = [
  { title: "Bohemian Rhapsody", artist: "Queen" },
  { title: "Don't Stop Believin'", artist: "Journey" },
  { title: "Livin' on a Prayer", artist: "Bon Jovi" },
  { title: "Sweet Caroline", artist: "Neil Diamond" },
  { title: "Mr. Brightside", artist: "The Killers" },
  { title: "Wonderwall", artist: "Oasis" },
  { title: "Africa", artist: "Toto" },
  { title: "Dancing Queen", artist: "ABBA" },
  { title: "Total Eclipse of the Heart", artist: "Bonnie Tyler" },
  { title: "I Will Survive", artist: "Gloria Gaynor" },
  { title: "Shallow", artist: "Lady Gaga" },
  { title: "Uptown Girl", artist: "Billy Joel" },
  { title: "Summer Nights", artist: "Grease" },
  { title: "Under Pressure", artist: "Queen & Bowie" },
  { title: "Toxic", artist: "Britney Spears" },
  { title: "Killing Me Softly", artist: "Fugees" },
];

const COLORS = [
  "#FF2D55", "#FF6B35", "#FFD60A", "#34C759",
  "#00C7BE", "#007AFF", "#AF52DE", "#FF375F",
  "#FF9F0A", "#30D158", "#32ADE6", "#BF5AF2",
  "#FF6961", "#FFB347", "#77DD77", "#AEC6CF",
];

const NUM_SEGMENTS = songs.length;
const FULL_CIRCLE = 2 * Math.PI;
const SEGMENT_ANGLE = FULL_CIRCLE / NUM_SEGMENTS;

function drawWheel(canvas, rotationAngle) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(cx, cy) - 8;

  ctx.clearRect(0, 0, W, H);

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius + 10);
  glow.addColorStop(0, "rgba(255,255,255,0)");
  glow.addColorStop(1, "rgba(255,200,50,0.15)");
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 10, 0, FULL_CIRCLE);
  ctx.fillStyle = glow;
  ctx.fill();

  for (let i = 0; i < NUM_SEGMENTS; i++) {
    const start = rotationAngle + i * SEGMENT_ANGLE;
    const end = start + SEGMENT_ANGLE;
    const mid = start + SEGMENT_ANGLE / 2;

    // Segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();

    // Subtle inner highlight
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius * 0.55, start, end);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();

    // Segment border
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;
    ctx.font = `bold ${radius < 150 ? 9 : 11}px 'Nunito', sans-serif`;
    ctx.fillText(songs[i].title, radius - 14, 4);
    ctx.font = `${radius < 150 ? 8 : 9.5}px 'Nunito', sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(songs[i].artist, radius - 14, 16);
    ctx.restore();
  }

  // Center hub
  const hubGrad = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 34);
  hubGrad.addColorStop(0, "#fff");
  hubGrad.addColorStop(1, "#ccc");
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, FULL_CIRCLE);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "bold 18px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#222";
  ctx.shadowColor = "transparent";
  ctx.fillText("🎤", cx, cy);
}

export default function KaraokeSpinner() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWheel(canvas, rotationRef.current);
  }, []);

  const spin = () => {
    if (spinning) return;
    setShowResult(false);
    setSelected(null);
    setSpinning(true);
    velocityRef.current = 0.25 + Math.random() * 0.35;

    const friction = 0.988;

    const animate = () => {
      rotationRef.current += velocityRef.current;
      velocityRef.current *= friction;
      drawWheel(canvasRef.current, rotationRef.current);

      if (velocityRef.current > 0.002) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Determine winner: pointer is at top (−π/2), find segment under it
        const normalized = (((-rotationRef.current - Math.PI / 2) % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
        const index = Math.floor(normalized / SEGMENT_ANGLE) % NUM_SEGMENTS;
        setSelected(songs[index]);
        setSpinning(false);
        setTimeout(() => setShowResult(true), 100);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a0d 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient stars */}
      {[...Array(24)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 3 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 3 : 2,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.4)",
          top: `${Math.sin(i * 137.5) * 50 + 50}%`,
          left: `${Math.cos(i * 97.3) * 50 + 50}%`,
          animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        @keyframes twinkle { from { opacity: 0.2; } to { opacity: 1; } }
        @keyframes popIn {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          70% { transform: scale(1.07) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,200,50,0.4), 0 0 60px rgba(255,100,0,0.2); }
          50% { box-shadow: 0 0 35px rgba(255,200,50,0.7), 0 0 90px rgba(255,100,0,0.35); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .spin-btn:hover:not(:disabled) { transform: scale(1.06); filter: brightness(1.1); }
        .spin-btn:active:not(:disabled) { transform: scale(0.96); }
        .spin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          fontSize: 13,
          letterSpacing: 6,
          color: "rgba(255,200,80,0.85)",
          textTransform: "uppercase",
          marginBottom: 6,
          fontWeight: 700,
        }}>🎶 Tonight's Stage</div>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(28px, 6vw, 46px)",
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 700,
          background: "linear-gradient(90deg, #FFD60A, #FF6B35, #FF2D55, #AF52DE, #FFD60A)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite",
        }}>Karaoke Roulette</h1>
      </div>

      {/* Wheel container */}
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Pointer */}
        <div style={{
          position: "absolute",
          top: -18,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
        }}>
          <svg width="32" height="36" viewBox="0 0 32 36">
            <polygon points="16,36 0,0 32,0" fill="#FFD60A" stroke="#222" strokeWidth="1.5" />
            <polygon points="16,28 6,4 26,4" fill="#FFB300" />
          </svg>
        </div>

        {/* Wheel glow ring */}
        <div style={{
          borderRadius: "50%",
          padding: 6,
          background: spinning
            ? "conic-gradient(from 0deg, #FF2D55, #FFD60A, #34C759, #007AFF, #AF52DE, #FF2D55)"
            : "rgba(255,255,255,0.08)",
          animation: spinning ? "pulseGlow 0.8s ease-in-out infinite" : "none",
          transition: "background 0.5s",
        }}>
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            style={{
              display: "block",
              borderRadius: "50%",
              cursor: spinning ? "not-allowed" : "pointer",
            }}
            onClick={spin}
          />
        </div>
      </div>

      {/* Spin button */}
      <button
        className="spin-btn"
        onClick={spin}
        disabled={spinning}
        style={{
          marginTop: 28,
          padding: "14px 52px",
          fontSize: 17,
          fontWeight: 900,
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: 2,
          textTransform: "uppercase",
          border: "none",
          borderRadius: 50,
          background: spinning
            ? "rgba(255,255,255,0.1)"
            : "linear-gradient(135deg, #FFD60A 0%, #FF6B35 50%, #FF2D55 100%)",
          color: spinning ? "rgba(255,255,255,0.4)" : "#1a0a0a",
          cursor: "pointer",
          transition: "transform 0.15s, filter 0.15s",
          boxShadow: spinning ? "none" : "0 4px 30px rgba(255,150,30,0.45)",
        }}
      >
        {spinning ? "Spinning…" : "🎰 Spin!"}
      </button>

      {/* Result card */}
      {showResult && selected && (
        <div style={{
          marginTop: 28,
          padding: "22px 32px",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20,
          textAlign: "center",
          animation: "popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
          maxWidth: 340,
          width: "100%",
        }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#FFD60A", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
            🎤 You're singing…
          </div>
          <div style={{
            fontSize: "clamp(20px, 5vw, 28px)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: 4,
            lineHeight: 1.2,
          }}>
            {selected.title}
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
            by {selected.artist}
          </div>
          <button
            onClick={spin}
            style={{
              marginTop: 16,
              background: "none",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.6)",
              borderRadius: 50,
              padding: "7px 22px",
              fontSize: 12,
              fontFamily: "'Nunito', sans-serif",
              cursor: "pointer",
              letterSpacing: 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "none"; e.target.style.color = "rgba(255,255,255,0.6)"; }}
          >
            ↺ Spin Again
          </button>
        </div>
      )}

      {/* Song count hint */}
      <div style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>
        {NUM_SEGMENTS} classic karaoke bangers
      </div>
    </div>
  );
}
