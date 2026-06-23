

const PARTICLES = ['🟩', '🟫', '⬛', '🔲', '💎', '⭐', '🌿', '🪨'];

export function initParticles(container) {
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  canvas.style.cssText = `
    position: absolute; inset: 0; pointer-events: none;
    width: 100%; height: 100%; z-index: 0;
  `;
  container.style.position = 'relative';
  container.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 12 + 8,
      speed: Math.random() * 0.6 + 0.2,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.3 + 0.05,
      emoji: PARTICLES[Math.floor(Math.random() * PARTICLES.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();

      p.y += p.speed;
      p.x += p.drift;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height + 30) {
        particles[i] = createParticle();
        particles[i].y = -20;
        particles[i].x = Math.random() * canvas.width;
      }
    });

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    particles = Array.from({ length: 18 }, () => {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      return p;
    });
    draw();
  }

  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(container);
  init();

  return () => {
    cancelAnimationFrame(animId);
    resizeObs.disconnect();
    canvas.remove();
  };
}
