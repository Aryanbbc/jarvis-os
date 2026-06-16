import { useEffect, useRef } from "react";

export default function VoiceOrb({ listening }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      const parent = canvas.parentElement;
      const size = Math.min(parent.clientWidth, parent.clientHeight, 520);

      canvas.width = size * window.devicePixelRatio;
      canvas.height = size * window.devicePixelRatio;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      ctx.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0
      );
    }

    function initParticles() {
      const count = 150;

      particlesRef.current = Array.from({ length: count }, (_, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const radius = 105 + Math.random() * 92;

        return {
          angle,
          radius,
          baseRadius: radius,
          speed: 0.002 + Math.random() * 0.006,
          size: 1 + Math.random() * 2.3,
          orbit: 0.6 + Math.random() * 1.4,
          pulse: Math.random() * Math.PI * 2,
        };
      });
    }

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const cx = width / 2;
      const cy = height / 2;
      const time = performance.now() * 0.001;
      const pulsePower = listening ? 1.18 + Math.sin(time * 5) * 0.08 : 0.92;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, width / 2);
      gradient.addColorStop(
        0,
        listening ? "rgba(0,255,136,0.28)" : "rgba(0,255,136,0.12)"
      );
      gradient.addColorStop(0.42, "rgba(0,255,136,0.08)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.42 * pulsePower, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);

      for (let ring = 0; ring < 5; ring++) {
        ctx.beginPath();
        ctx.arc(0, 0, 68 + ring * 34 * pulsePower, 0, Math.PI * 2);
        ctx.strokeStyle =
          ring % 2 === 0
            ? "rgba(0,255,136,0.23)"
            : "rgba(0,229,255,0.16)";
        ctx.lineWidth = ring === 0 ? 1.8 : 1;
        ctx.setLineDash(ring % 2 === 0 ? [8, 12] : [2, 10]);
        ctx.lineDashOffset = -time * 20 * (ring + 1);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      particlesRef.current.forEach((particle, index) => {
        particle.angle += particle.speed * (listening ? 2.7 : 1);
        particle.pulse += 0.025;

        const wave = Math.sin(particle.pulse + time * 2.5) * (listening ? 18 : 7);
        const radius = (particle.baseRadius + wave) * pulsePower;
        const x = Math.cos(particle.angle * particle.orbit) * radius;
        const y = Math.sin(particle.angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, particle.size * (listening ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle =
          index % 5 === 0
            ? "rgba(0,229,255,0.95)"
            : "rgba(0,255,136,0.88)";
        ctx.fill();

        if (index % 9 === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x * 0.82, y * 0.82);
          ctx.strokeStyle = "rgba(0,255,136,0.18)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      ctx.beginPath();
      ctx.arc(0, 0, 54 * pulsePower, 0, Math.PI * 2);
      ctx.fillStyle = listening
        ? "rgba(0,255,136,0.22)"
        : "rgba(0,255,136,0.08)";
      ctx.fill();
      ctx.strokeStyle = listening
        ? "rgba(0,255,136,0.95)"
        : "rgba(0,255,136,0.42)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 17 * pulsePower, 0, Math.PI * 2);
      ctx.fillStyle = listening
        ? "rgba(0,255,136,1)"
        : "rgba(0,255,136,0.45)";
      ctx.fill();

      ctx.restore();

      frameRef.current = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [listening]);

  return (
    <div className="relative w-full h-full min-h-[420px] flex items-center justify-center">
      <canvas ref={canvasRef} className="block" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.45em] text-cyan-300 uppercase mb-3">
            Voice Interface
          </p>

          <p
            className={`text-2xl font-black tracking-[0.24em] uppercase ${
              listening ? "text-[#00ff88]" : "text-[#007a43]"
            }`}
          >
            {listening ? "Listening" : "Standby"}
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.24em] uppercase text-cyan-300">
        local whisper · kokoro tts · vault memory
      </div>
    </div>
  );
}