import { useEffect, useRef, useState } from "react";
import { demoMetrics, demoSkills, demoRecent, demoCommandReply } from "./demoData";

const API_BASE = "http://localhost:8000";

const DEMO_METRICS = {
  total_word_count: 135000,
  file_count: 202,
  readable_file_count: 202,
  last_5_modified_files: [
    {
      name: "2026-06-16-ai-engineer-roadmap.md",
      path: "reports/2026-06-16-ai-engineer-roadmap.md",
      modified_at: "2026-06-16T18:45:00",
      size_bytes: 4200,
    },
    {
      name: "2026-06-16-python-calculator.md",
      path: "reports/2026-06-16-python-calculator.md",
      modified_at: "2026-06-16T18:38:00",
      size_bytes: 2100,
    },
    {
      name: "2026-06-16-daily-brief.md",
      path: "daily/2026-06-16.md",
      modified_at: "2026-06-16T18:20:00",
      size_bytes: 1800,
    },
  ],
};

const DEMO_SKILLS = [
  {
    name: "coding",
    trigger_words: ["code", "build", "fix", "debug", "create", "implement", "setup"],
  },
  {
    name: "daily-brief",
    trigger_words: ["today", "schedule", "agenda", "tasks", "daily brief"],
  },
  {
    name: "research",
    trigger_words: ["find", "search", "research", "investigate", "compare", "summarize"],
  },
];

const DEMO_RECENT = [
  {
    title: "AI Engineer Roadmap",
    date: "2026-06-16",
    path: "reports/2026-06-16-ai-engineer-roadmap.md",
    preview: "A practical roadmap for becoming an AI engineer with projects, DSA, ML basics, and portfolio strategy.",
  },
  {
    title: "Python Calculator",
    date: "2026-06-16",
    path: "reports/2026-06-16-python-calculator.md",
    preview: "A simple Python calculator with add, subtract, multiply, divide, and input validation.",
  },
  {
    title: "Daily Brief",
    date: "2026-06-16",
    path: "daily/2026-06-16.md",
    preview: "Today’s focus: build Jarvis OS foundation, connect skills, vault memory, dashboard, and voice.",
  },
];



export default function App() {
  const [metrics, setMetrics] = useState(DEMO_METRICS);
  const [skills, setSkills] = useState(DEMO_SKILLS);
  const [recent, setRecent] = useState(DEMO_RECENT);
  const [status, setStatus] = useState("DEMO");
  const [time, setTime] = useState(new Date());

  const [command, setCommand] = useState("");
  const [jarvisReply, setJarvisReply] = useState("");
  const [commandLoading, setCommandLoading] = useState(false);

  async function loadData() {
    try {
      const [metricsRes, skillsRes, recentRes] = await Promise.all([
        fetch(`${API_BASE}/metrics`),
        fetch(`${API_BASE}/skills`),
        fetch(`${API_BASE}/vault/recent`),
      ]);

      const metricsData = await metricsRes.json();
      const skillsData = await skillsRes.json();
      const recentData = await recentRes.json();

      setMetrics(metricsData);
      setSkills(skillsData.skills || []);
      setRecent(recentData.entries || []);
      setStatus("ONLINE");
    } catch {
      setMetrics(DEMO_METRICS);
      setSkills(DEMO_SKILLS);
      setRecent(DEMO_RECENT);
      setStatus("DEMO");
    }
  }

  async function sendCommand() {
    const clean = command.trim();

    if (!clean || commandLoading) return;

    setCommandLoading(true);
    setJarvisReply("Thinking locally...");

    try {
      const res = await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: clean }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Command failed");
      }

      setJarvisReply(data.reply || "No reply returned.");
      setCommand("");
      loadData();
    } catch (err) {
      const demoReply = demoCommandReply(clean);
      setJarvisReply(demoReply);
      setRecent((current) => [
        {
          title: clean,
          date: new Date().toISOString().slice(0, 10),
          path: "demo/generated-command.md",
          preview: demoReply,
        },
        ...current,
      ]);
      setMetrics((current) => ({
        ...(current || DEMO_METRICS),
        total_word_count: (current?.total_word_count || DEMO_METRICS.total_word_count) + clean.split(/\s+/).length + 40,
        file_count: (current?.file_count || DEMO_METRICS.file_count) + 1,
      }));
      setStatus("DEMO");
    } finally {
      setCommandLoading(false);
    }
  }

  function handleCommandKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      sendCommand();
    }
  }

  useEffect(() => {
    loadData();

    const dataTimer = setInterval(loadData, 3500);
    const clockTimer = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(dataTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const wordCount = metrics?.total_word_count ?? 0;
  const fileCount = metrics?.file_count ?? 0;
  const skillCount = skills.length;
  const health = status === "ONLINE" || status === "DEMO" ? 96 : 0;

  return (
    <main className="vault-page">
      <div className="noise" />
      <div className="green-vignette" />
      <div className="background-lines" />

      <section className="vault-window">
        <header className="nav">
          <div className="brand">
            <h1>V.A.U.L.T.</h1>
            <p>VOICE · AGENT · UTILITY · LOCAL · TERMINAL</p>
          </div>

          <div className="navlinks">
            <span>CORE</span>
            <span>SKILLS</span>
            <span>VAULT</span>
            <span>VOICE</span>
            <span>MEMORY</span>
            <span>ROUTER</span>
          </div>

          <div className="time">
            <strong>{time.toLocaleTimeString()}</strong>
            <small>{status}</small>
          </div>
        </header>

        <section className="layout">
          <aside className="metrics-panel">
            <div className="section-kicker">SYSTEM</div>
            <div className="section-title">METRICS</div>

            <MetricLine
              value={formatBig(wordCount)}
              label="WORDS INDEXED"
              delta="+2.4%"
              points="0,44 35,42 70,41 105,39 140,36 175,35 210,33 245,27 290,25"
            />

            <MetricLine
              value={formatBig(fileCount)}
              label="VAULT FILES"
              delta="+0.8%"
              points="0,51 35,50 70,49 105,46 140,44 175,43 210,39 245,38 290,36"
            />

            <MetricLine
              value={formatBig(skillCount)}
              label="SKILLS LOADED"
              delta="+1.1%"
              points="0,50 35,48 70,47 105,44 140,42 175,38 210,36 245,33 290,30"
            />

            <MetricLine
              value={`${health}%`}
              label="SYSTEM HEALTH"
              delta="+4.6%"
              points="0,52 35,51 70,49 105,48 140,45 175,44 210,42 245,38 290,37"
            />

            <div className="requests">
              <h3>RECENT REQUESTS</h3>

              {recent.length === 0 ? (
                <p className="dim">No memory yet.</p>
              ) : (
                recent.slice(0, 5).map((entry) => (
                  <div className="request-row" key={entry.path}>
                    <span>{entry.title}</span>
                    <small>{entry.date}</small>
                  </div>
                ))
              )}
            </div>
          </aside>

          <section className="brain-panel">
            <div className="brain-top">
              <span>LOCAL VOICE INTERFACE</span>
              <strong>JARVIS CORE</strong>
              <span>WHISPER · KOKORO · OLLAMA ROUTER</span>
            </div>

            <ParticleBrain />

            <div className="floor-grid" />

            <div className="brain-number">
              <strong>{formatBig(wordCount)}</strong>
              <span>WORDS</span>
            </div>

            <div className="brain-copy">
              <p>Every response becomes memory. Every skill routes intent.</p>
              <p>Vault indexed locally · voice loop ready · API synced</p>
            </div>
          </section>

          <aside className="skills-panel">
            <div className="section-kicker">ACTIVE</div>
            <div className="section-title">SKILLS</div>

            <div className="skill-list">
              {skills.length === 0 ? (
                <div className="skill-card">
                  <div className="skill-head">
                    <strong>NO SKILLS</strong>
                    <small>WAITING</small>
                  </div>
                  <p>No SKILL.md files detected.</p>
                </div>
              ) : (
                skills.map((skill) => (
                  <div className="skill-card" key={skill.name}>
                    <div className="skill-head">
                      <strong>{skill.name}</strong>
                      <small>ACTIVE</small>
                    </div>
                    <p>{(skill.trigger_words || []).slice(0, 11).join(" · ")}</p>
                  </div>
                ))
              )}
            </div>

            <div className="command-center">
              <h3>COMMAND CENTER</h3>

              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleCommandKeyDown}
                placeholder="Type command... example: research AI engineer roadmap"
              />

              <button onClick={sendCommand} disabled={commandLoading}>
                {commandLoading ? "RUNNING..." : "RUN COMMAND"}
              </button>

              {jarvisReply && (
                <div className="reply-box">
                  <strong>JARVIS REPLY</strong>
                  <p>{jarvisReply}</p>
                </div>
              )}
            </div>

            <div className="router-log">
              <h3>LIVE ROUTER LOG</h3>
              <pre>{`$ vault scan --recent
✓ memory index loaded
✓ skills registered
✓ voice bridge standing by

$ api status
${status.toLowerCase()}

$ route mode
skill → ollama → vault-save

$ last sync
${time.toLocaleTimeString()}`}</pre>
            </div>
          </aside>
        </section>

        <footer className="dock">
          <div className="dock-icons">
            <span className="active">⌘</span>
            <span>⚡</span>
            <span>✦</span>
            <span>◉</span>
            <span>AI</span>
            <span>M</span>
            <span>G</span>
            <span>S</span>
          </div>

          <div className="ticker">
            <div>
              {recent.length === 0 ? (
                <span>WAITING FOR MEMORY ENTRIES...</span>
              ) : (
                [...recent, ...recent].map((entry, index) => (
                  <span key={`${entry.path}-${index}`}>
                    {entry.title} · {entry.date} · {entry.preview}
                  </span>
                ))
              )}
            </div>
          </div>
        </footer>
      </section>

      <style>{css}</style>
    </main>
  );
}

function MetricLine({ value, label, delta, points }) {
  return (
    <div className="metric-line">
      <div className="metric-left">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

      <div className="metric-right">
        <div className="delta">
          <small>▲ {delta}</small>
          <em>/day</em>
        </div>

        <svg viewBox="0 0 300 70" preserveAspectRatio="none">
          <line x1="0" y1="58" x2="300" y2="58" className="base-line" />

          <polyline
            points={points}
            fill="none"
            className="graph-line"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx="292" cy="26" r="3" className="graph-dot" />
        </svg>
      </div>
    </div>
  );
}

function ParticleBrain() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      const parent = canvas.parentElement;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = rect.width / 2;
      const cy = rect.height * 0.48;
      const count = 520;

      particlesRef.current = Array.from({ length: count }, (_, index) => {
        const angle = Math.random() * Math.PI * 2;
        const radius =
          Math.pow(Math.random(), 0.56) *
          Math.min(rect.width, rect.height) *
          0.34;
        const squash = 0.82 + Math.random() * 0.22;

        return {
          index,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius * squash,
          ox: cx + Math.cos(angle) * radius,
          oy: cy + Math.sin(angle) * radius * squash,
          vx: (Math.random() - 0.5) * 0.36,
          vy: (Math.random() - 0.5) * 0.36,
          size: 0.6 + Math.random() * 2.3,
          pulse: Math.random() * Math.PI * 2,
        };
      });
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const time = performance.now() * 0.001;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.48;

      const glow = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.min(w, h) * 0.52
      );
      glow.addColorStop(0, "rgba(0,255,136,0.23)");
      glow.addColorStop(0.34, "rgba(0,255,136,0.095)");
      glow.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      particlesRef.current.forEach((p, i) => {
        p.pulse += 0.018;
        p.x += p.vx + Math.sin(time + i * 0.2) * 0.06;
        p.y += p.vy + Math.cos(time * 0.7 + i * 0.2) * 0.06;

        p.x += (p.ox - p.x) * 0.018;
        p.y += (p.oy - p.y) * 0.018;

        const alpha = 0.42 + Math.sin(p.pulse) * 0.35;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          i % 9 === 0
            ? `rgba(0,229,255,${alpha})`
            : `rgba(0,255,136,${alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particlesRef.current.length; i += 5) {
        const a = particlesRef.current[i];

        for (let j = i + 1; j < particlesRef.current.length; j += 31) {
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < 58) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,255,136,${0.1 * (1 - d / 58)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas className="particle-brain" ref={canvasRef} />;
}

function formatBig(value) {
  if (typeof value === "number" && value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }

  return value;
}

const css = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #050605;
}

.vault-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.08), transparent 38%),
    linear-gradient(180deg, #050605, #000000);
  color: #f4fff8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
  padding: 26px;
  position: relative;
  overflow: hidden;
}

.noise {
  position: fixed;
  inset: 0;
  opacity: 0.035;
  pointer-events: none;
  background-image: repeating-radial-gradient(circle at 10% 10%, #fff 0 1px, transparent 1px 5px);
  mix-blend-mode: screen;
}

.green-vignette {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.68) 72%, rgba(0,0,0,0.92)),
    radial-gradient(circle at 52% 42%, rgba(0,255,136,0.12), transparent 30%);
  pointer-events: none;
}

.background-lines {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(circle at center, black, transparent 78%);
  pointer-events: none;
}

.vault-window {
  position: relative;
  z-index: 2;
  height: calc(100vh - 52px);
  background: rgba(0,0,0,0.62);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow:
    0 30px 120px rgba(0,0,0,0.88),
    inset 0 0 80px rgba(0,255,136,0.035);
  overflow: hidden;
}

.vault-window::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    115deg,
    rgba(255,255,255,0.018) 0px,
    rgba(255,255,255,0.018) 1px,
    transparent 1px,
    transparent 7px
  );
  pointer-events: none;
  opacity: 0.45;
}

.nav {
  height: 58px;
  display: grid;
  grid-template-columns: 300px 1fr 190px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.11);
  position: relative;
  z-index: 2;
  background: rgba(0,0,0,0.58);
}

.brand {
  padding-left: 20px;
}

.brand h1 {
  margin: 0;
  color: #ffffff;
  font-size: 15px;
  letter-spacing: 0.46em;
  font-weight: 900;
}

.brand p {
  margin: 7px 0 0;
  color: #00ff88;
  font-size: 8px;
  letter-spacing: 0.18em;
}

.navlinks {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.navlinks span {
  color: rgba(255,255,255,0.56);
  font-size: 10px;
  letter-spacing: 0.28em;
}

.time {
  padding-right: 20px;
  text-align: right;
}

.time strong {
  display: block;
  color: #ffffff;
  font-size: 23px;
  letter-spacing: 0.06em;
}

.time small {
  display: block;
  margin-top: 4px;
  color: #00ff88;
  font-size: 9px;
  letter-spacing: 0.28em;
}

.layout {
  height: calc(100% - 116px);
  display: grid;
  grid-template-columns: 310px 1fr 360px;
  position: relative;
  z-index: 2;
}

.metrics-panel,
.skills-panel {
  background: rgba(0,0,0,0.34);
  padding: 28px 22px;
}

.metrics-panel {
  border-right: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}

.skills-panel {
  border-left: 1px solid rgba(255,255,255,0.1);
  overflow-y: auto;
  overflow-x: hidden;
}

.skills-panel::-webkit-scrollbar {
  width: 6px;
}

.skills-panel::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.04);
}

.skills-panel::-webkit-scrollbar-thumb {
  background: rgba(0,255,136,0.5);
}

.section-kicker {
  color: #00ff88;
  font-size: 9px;
  letter-spacing: 0.34em;
  margin-bottom: 14px;
}

.section-title {
  color: #ffffff;
  font-size: 29px;
  line-height: 1;
  letter-spacing: 0.16em;
  font-weight: 900;
  margin-bottom: 30px;
}

.metric-line {
  height: 88px;
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 14px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  position: relative;
}

.metric-left strong {
  display: block;
  color: #ffffff;
  font-size: 34px;
  line-height: 0.9;
  letter-spacing: -0.08em;
  font-weight: 900;
  text-shadow: 0 0 16px rgba(255,255,255,0.2);
}

.metric-left span {
  display: block;
  margin-top: 11px;
  color: rgba(255,255,255,0.43);
  font-size: 8px;
  line-height: 1.4;
  letter-spacing: 0.24em;
}

.metric-right {
  height: 70px;
  position: relative;
}

.delta {
  position: absolute;
  right: 0;
  top: 6px;
  display: flex;
  gap: 7px;
  z-index: 2;
}

.delta small {
  color: rgba(255,255,255,0.78);
  font-size: 8px;
  letter-spacing: 0.12em;
}

.delta em {
  color: rgba(255,255,255,0.35);
  font-size: 8px;
  font-style: normal;
}

.metric-right svg {
  position: absolute;
  inset: 11px 0 0;
  width: 100%;
  height: 58px;
  overflow: visible;
}

.base-line {
  stroke: rgba(255,255,255,0.2);
  stroke-width: 1;
}

.graph-line {
  stroke: rgba(255,255,255,0.68);
  filter: drop-shadow(0 0 3px rgba(255,255,255,0.22));
}

.graph-dot {
  fill: #00ff88;
  filter: drop-shadow(0 0 8px rgba(0,255,136,0.9));
}

.requests {
  margin-top: 25px;
}

.requests h3,
.router-log h3,
.command-center h3 {
  margin: 0 0 15px;
  color: #ffffff;
  font-size: 11px;
  letter-spacing: 0.3em;
}

.request-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 10px 0;
}

.request-row span {
  color: rgba(255,255,255,0.75);
  font-size: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.request-row small {
  color: rgba(0,229,255,0.7);
  font-size: 9px;
}

.brain-panel {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 45%, rgba(0,255,136,0.13), transparent 32%),
    rgba(0,0,0,0.2);
}

.brain-top {
  height: 54px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 27px;
  color: rgba(255,255,255,0.46);
  font-size: 9px;
  letter-spacing: 0.24em;
  position: relative;
  z-index: 3;
}

.brain-top strong {
  color: #ffffff;
  font-size: 12px;
  letter-spacing: 0.25em;
}

.particle-brain {
  position: absolute;
  inset: 55px 0 112px;
  width: 100%;
  height: calc(100% - 167px);
  z-index: 2;
}

.floor-grid {
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 76px;
  height: 210px;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(0,255,136,0.18) 0px,
      rgba(0,255,136,0.18) 1px,
      transparent 1px,
      transparent 16px
    );
  transform: perspective(520px) rotateX(62deg);
  transform-origin: bottom;
  opacity: 0.5;
  z-index: 1;
}

.floor-grid::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,255,136,0.16), transparent 75%);
}

.brain-number {
  position: absolute;
  bottom: 64px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 4;
}

.brain-number strong {
  display: block;
  color: #ffffff;
  font-size: 60px;
  line-height: 0.9;
  font-weight: 900;
  letter-spacing: -0.08em;
  text-shadow: 0 0 28px rgba(0,255,136,0.48);
}

.brain-number span {
  display: block;
  margin-top: 18px;
  color: rgba(255,255,255,0.48);
  font-size: 9px;
  letter-spacing: 0.46em;
}

.brain-copy {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 26px;
  text-align: center;
  z-index: 4;
}

.brain-copy p {
  margin: 4px 0;
  color: rgba(0,255,136,0.78);
  font-size: 10px;
  letter-spacing: 0.15em;
}

.skill-list {
  display: grid;
  gap: 13px;
}

.skill-card {
  border: 1px solid rgba(255,255,255,0.13);
  background: rgba(0,0,0,0.38);
  padding: 14px;
}

.skill-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 11px;
}

.skill-head strong {
  color: #ffffff;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.skill-head small {
  color: #00ff88;
  font-size: 9px;
  letter-spacing: 0.2em;
}

.skill-card p {
  margin: 0;
  color: rgba(0,229,255,0.76);
  font-size: 11px;
  line-height: 1.55;
}

.command-center {
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.command-center textarea {
  width: 100%;
  height: 92px;
  resize: none;
  display: block;
  background: rgba(0,0,0,0.62);
  border: 1px solid rgba(255,255,255,0.16);
  color: #ffffff;
  padding: 12px;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.45;
  outline: none;
  caret-color: #00ff88;
}

.command-center textarea::placeholder {
  color: rgba(255,255,255,0.38);
}

.command-center textarea:focus {
  border-color: #00ff88;
  box-shadow: 0 0 18px rgba(0,255,136,0.18);
}

.command-center button {
  display: block;
  margin-top: 10px;
  width: 100%;
  height: 38px;
  background: rgba(0,255,136,0.12);
  border: 1px solid rgba(0,255,136,0.65);
  color: #00ff88;
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.24em;
  cursor: pointer;
}

.command-center button:hover {
  background: rgba(0,255,136,0.22);
}

.command-center button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-box {
  margin-top: 14px;
  padding: 12px;
  background: rgba(0,0,0,0.46);
  border-left: 2px solid #00ff88;
}

.reply-box strong {
  display: block;
  color: #00ff88;
  font-size: 10px;
  letter-spacing: 0.2em;
  margin-bottom: 8px;
}

.reply-box p {
  margin: 0;
  color: rgba(255,255,255,0.78);
  font-size: 11px;
  line-height: 1.55;
  max-height: 160px;
  overflow: auto;
}

.router-log {
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.router-log pre {
  color: rgba(255,255,255,0.74);
  font-size: 11px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.dock {
  height: 58px;
  display: grid;
  grid-template-columns: 472px 1fr;
  border-top: 1px solid rgba(255,255,255,0.11);
  background: rgba(0,0,0,0.56);
  position: relative;
  z-index: 4;
}

.dock-icons {
  display: grid;
  grid-template-columns: repeat(8, 59px);
  border-right: 1px solid rgba(255,255,255,0.1);
}

.dock-icons span {
  display: grid;
  place-items: center;
  color: rgba(255,255,255,0.46);
  border-right: 1px solid rgba(255,255,255,0.08);
  font-size: 15px;
}

.dock-icons .active {
  color: #00ff88;
  text-shadow: 0 0 16px rgba(0,255,136,0.9);
}

.ticker {
  overflow: hidden;
  display: flex;
  align-items: center;
  color: rgba(0,255,136,0.78);
  font-size: 11px;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.ticker div {
  animation: ticker 35s linear infinite;
}

.ticker span {
  margin-right: 80px;
}

.dim {
  color: rgba(255,255,255,0.42);
  font-size: 11px;
}

@keyframes ticker {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 1100px) {
  .vault-page {
    overflow: auto;
  }

  .vault-window {
    height: auto;
    min-height: 100vh;
  }

  .nav {
    height: auto;
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 18px;
  }

  .brand {
    padding-left: 0;
  }

  .navlinks {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .time {
    text-align: left;
    padding-right: 0;
  }

  .layout {
    height: auto;
    grid-template-columns: 1fr;
  }

  .brain-panel {
    min-height: 620px;
  }

  .metrics-panel,
  .skills-panel {
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .dock {
    grid-template-columns: 1fr;
    height: auto;
  }

  .dock-icons {
    grid-template-columns: repeat(8, 1fr);
  }

  .ticker {
    height: 46px;
    padding: 0 16px;
  }
}
`;