// ============================================================
// TrLaucher — True 3D Isometric Canvas Character Preview
// Features: Drag to rotate, 3D texturing, Idle breathing, Waving
// ============================================================

export class CharacterPreview {
  constructor(canvas, skinData, skinModel = 'classic') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.skinData = skinData;
    this.skinModel = skinModel;

    // Zoom and visibility options
    this.zoom = 4.2;
    this.visibleParts = {
      head: true,
      torso: true,
      leftArm: true,
      rightArm: true,
      leftLeg: true,
      rightLeg: true
    };

    // Rotation angles (pitch for slight top-down view, yaw for Y-axis rotation)
    this.yaw = -0.4; 
    this.targetYaw = -0.4;
    this.pitch = 0.25; // 15 degrees tilt down

    this.isDragging = false;
    this.startX = 0;
    this.startYaw = 0;

    this.time = 0;
    this.waveState = 0;
    this.isHovered = false;

    this.initEvents();
    this.startLoop();
  }

  setPartVisibility(part, isVisible) {
    if (this.visibleParts.hasOwnProperty(part)) {
      this.visibleParts[part] = isVisible;
    }
  }

  updateSkin(skinData, skinModel = 'classic') {
    this.skinData = skinData;
    this.skinModel = skinModel;
    this.isLoaded = false;
    this.skinImage = null;
    this.loadSkinImage();
  }

  loadSkinImage() {
    if (typeof this.skinData === 'string' && this.skinData.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        this.skinImage = img;
        this.isLoaded = true;
      };
      img.src = this.skinData;
    } else {
      this.isLoaded = true;
    }
  }

  initEvents() {
    const handleStart = (e) => {
      this.isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      this.startX = clientX;
      this.startYaw = this.targetYaw;
    };

    const handleMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - this.startX;
      // Responsive rotation sensitivity (0.055)
      this.targetYaw = this.startYaw + deltaX * 0.055;
    };

    const handleEnd = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    this.canvas.addEventListener('touchstart', handleStart);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    this.canvas.addEventListener('mouseenter', () => {
      this.isHovered = true;
      if (this.waveState === 0) this.waveState = 0.01;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.isHovered = false;
    });
    this.canvas.addEventListener('click', () => {
      if (this.waveState === 0) this.waveState = 0.01;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomAmount = e.deltaY * -0.003;
      this.zoom = Math.max(2.5, Math.min(8.0, this.zoom + zoomAmount));
    }, { passive: false });
  }

  startLoop() {
    const tick = () => {
      this.time += 0.04;
      this.yaw += (this.targetYaw - this.yaw) * 0.15;

      if (this.waveState > 0) {
        this.waveState += 0.08;
        if (this.waveState > Math.PI * 2) {
          this.waveState = this.isHovered ? 0.01 : 0;
        }
      }

      this.draw();
      requestAnimationFrame(tick);
    };
    this.loadSkinImage();
    requestAnimationFrame(tick);
  }

  // Projects a 3D point (x, y, z) into 2D space with Yaw/Pitch rotation
  project(x, y, z, yaw, pitch) {
    // Y-axis rotation (Yaw)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;

    // X-axis rotation (Pitch)
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    let y2 = y * cosP - z1 * sinP;
    let z2 = y * sinP + z1 * cosP;

    return { x: x1, y: y2, z: z2 };
  }

  // Renders a 3D Cuboid using 2D parallelogram texturing or solid colors
  drawCuboid(ctx, cx, cy, w, h, d, yaw, pitch, textures, colors, animRotation = 0, animOffsetX = 0, animOffsetY = 0) {
    ctx.save();
    ctx.translate(cx, cy);

    // Dynamic yaw of this specific limb/part
    const partYaw = yaw + animRotation;

    // Define 8 vertices of the cuboid in 3D
    const hw = w / 2;
    const hh = h / 2;
    const hd = d / 2;

    const localVertices = [
      { x: -hw, y: -hh, z: -hd }, // 0
      { x:  hw, y: -hh, z: -hd }, // 1
      { x:  hw, y:  hh, z: -hd }, // 2
      { x: -hw, y:  hh, z: -hd }, // 3
      { x: -hw, y: -hh, z:  hd }, // 4
      { x:  hw, y: -hh, z:  hd }, // 5
      { x:  hw, y:  hh, z:  hd }, // 6
      { x: -hw, y:  hh, z:  hd }  // 7
    ];

    // Project all vertices
    const pts = localVertices.map(v => {
      // Apply anim offsets in 3D local space
      const p = this.project(v.x + animOffsetX, v.y + animOffsetY, v.z, partYaw, pitch);
      return p;
    });

    const isPreset = !this.skinImage;

    const drawFace = (indices, tex, color, shadeFactor) => {
      const p0 = pts[indices[0]];
      const p1 = pts[indices[1]];
      const p2 = pts[indices[2]];
      const p3 = pts[indices[3]];

      // Backface culling: calculate polygon area in 2D
      const area = (p1.x - p0.x) * (p3.y - p0.y) - (p1.y - p0.y) * (p3.x - p0.x);
      if (area <= 0) return; // Hidden face

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      if (!isPreset && this.skinImage && tex) {
        // Advanced parallelogram texture mapping
        ctx.clip();
        const sw = tex.sw;
        const sh = tex.sh;
        const m11 = (p1.x - p0.x) / sw;
        const m12 = (p1.y - p0.y) / sw;
        const m21 = (p3.x - p0.x) / sh;
        const m22 = (p3.y - p0.y) / sh;
        ctx.transform(m11, m12, m21, m22, p0.x, p0.y);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.skinImage, tex.sx, tex.sy, sw, sh, 0, 0, sw, sh);
      } else {
        ctx.fillStyle = color;
        ctx.fill();
        // Add subtle shading overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${shadeFactor})`;
        ctx.fill();
      }
      ctx.restore();
    };

    // Front: 0, 1, 2, 3
    drawFace([0, 1, 2, 3], textures?.front, colors.front, 0);
    // Back Face: 5, 4, 7, 6
    drawFace([5, 4, 7, 6], textures?.back, colors.side, 0.15);
    // Right Side: 1, 5, 6, 2
    drawFace([1, 5, 6, 2], textures?.right, colors.side, 0.12);
    // Left Side: 4, 0, 3, 7
    drawFace([4, 0, 3, 7], textures?.left, colors.side, 0.12);
    // Top Face: 4, 5, 1, 0
    drawFace([4, 5, 1, 0], textures?.top, colors.top, 0.05);
    // Bottom Face: 3, 2, 6, 7
    drawFace([3, 2, 6, 7], textures?.bottom, colors.bottom, 0.2);

    ctx.restore();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    // Drawing Scale & Center (Dynamic Zoom)
    const scale = this.zoom;
    const cx = w / 2;
    const cy = h / 2 - 15;
 
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
 
    // Subtle breathing calculations
    const breathing = Math.sin(this.time) * 0.04;
    const limbSway = Math.sin(this.time) * 0.12;
 
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 52, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
 
    // Preset color mappings
    const colors = !this.skinImage ? (this.skinData?.colors || ['#C68642','#7B4F2E','#3C5986','#6699FF']) : null;
    const hair = colors ? colors[0] : '#000';
    const skin = colors ? colors[1] : '#fff';
    const shirt = colors ? colors[2] : '#777';
    const pants = colors ? colors[3] : '#333';
 
    const colorHead = { front: skin, side: hair, top: hair, bottom: skin };
    const colorTorso = { front: shirt, side: shirt, top: shirt, bottom: shirt };
    const colorPants = { front: pants, side: pants, top: pants, bottom: pants };
    const colorArm = { front: shirt, side: shirt, top: shirt, bottom: skin };
 
    // Standard Minecraft Texture UV Map Coordinates with Back Face Included
    const uvHead = {
      front:  { sx: 8, sy: 8, sw: 8, sh: 8 },
      right:  { sx: 0, sy: 8, sw: 8, sh: 8 },
      left:   { sx: 16, sy: 8, sw: 8, sh: 8 },
      back:   { sx: 24, sy: 8, sw: 8, sh: 8 },
      top:    { sx: 8, sy: 0, sw: 8, sh: 8 },
      bottom: { sx: 16, sy: 0, sw: 8, sh: 8 }
    };
    const uvTorso = {
      front:  { sx: 20, sy: 20, sw: 8, sh: 12 },
      right:  { sx: 16, sy: 20, sw: 4, sh: 12 },
      left:   { sx: 28, sy: 20, sw: 4, sh: 12 },
      back:   { sx: 32, sy: 20, sw: 8, sh: 12 },
      top:    { sx: 20, sy: 16, sw: 8, sh: 4 },
      bottom: { sx: 28, sy: 16, sw: 8, sh: 4 }
    };
    const uvLeg = {
      front:  { sx: 4, sy: 20, sw: 4, sh: 12 },
      right:  { sx: 0, sy: 20, sw: 4, sh: 12 },
      left:   { sx: 8, sy: 20, sw: 4, sh: 12 },
      back:   { sx: 12, sy: 20, sw: 4, sh: 12 },
      top:    { sx: 4, sy: 16, sw: 4, sh: 4 },
      bottom: { sx: 8, sy: 16, sw: 4, sh: 4 }
    };
    const uvArm = this.skinModel === 'slim' ? {
      front:  { sx: 44, sy: 20, sw: 3, sh: 12 },
      right:  { sx: 40, sy: 20, sw: 4, sh: 12 },
      left:   { sx: 47, sy: 20, sw: 4, sh: 12 },
      back:   { sx: 51, sy: 20, sw: 3, sh: 12 },
      top:    { sx: 44, sy: 16, sw: 3, sh: 4 },
      bottom: { sx: 47, sy: 16, sw: 3, sh: 4 }
    } : {
      front:  { sx: 44, sy: 20, sw: 4, sh: 12 },
      right:  { sx: 40, sy: 20, sw: 4, sh: 12 },
      left:   { sx: 48, sy: 20, sw: 4, sh: 12 },
      back:   { sx: 52, sy: 20, sw: 4, sh: 12 },
      top:    { sx: 44, sy: 16, sw: 4, sh: 4 },
      bottom: { sx: 48, sy: 16, sw: 4, sh: 4 }
    };

    const torsoY = 4 + breathing * 1.5;
    const armW = this.skinModel === 'slim' ? 6 : 8;
    const headY = torsoY - 18;

    // Define limb objects for dynamic Z-depth sorting
    const parts = [
      {
        name: 'leftLeg',
        x: -4, y: 26, z: 0,
        draw: () => {
          if (this.visibleParts.leftLeg) {
            this.drawCuboid(ctx, -4, 26, 8, 24, 8, this.yaw, this.pitch, uvLeg, colorPants, limbSway, 0, 10);
          }
        }
      },
      {
        name: 'rightLeg',
        x: 4, y: 26, z: 0,
        draw: () => {
          if (this.visibleParts.rightLeg) {
            this.drawCuboid(ctx, 4, 26, 8, 24, 8, this.yaw, this.pitch, uvLeg, colorPants, -limbSway, 0, 10);
          }
        }
      },
      {
        name: 'torso',
        x: 0, y: torsoY, z: 0,
        draw: () => {
          if (this.visibleParts.torso) {
            this.drawCuboid(ctx, 0, torsoY, 16, 24, 8, this.yaw, this.pitch, uvTorso, colorTorso);
          }
        }
      },
      {
        name: 'leftArm',
        x: -11, y: torsoY - 6, z: 0,
        draw: () => {
          if (this.visibleParts.leftArm) {
            this.drawCuboid(ctx, -11, torsoY - 6, armW, 24, 8, this.yaw, this.pitch, uvArm, colorArm, -limbSway, 0, 8);
          }
        }
      },
      {
        name: 'rightArm',
        x: 11, y: torsoY - 6, z: 0,
        draw: () => {
          if (this.visibleParts.rightArm) {
            let rightArmRot = -limbSway;
            if (this.waveState > 0) {
              rightArmRot = -Math.PI * 0.75 + Math.sin(this.waveState * 4) * 0.18;
            }
            this.drawCuboid(ctx, 11, torsoY - 6, armW, 24, 8, this.yaw, this.pitch, uvArm, colorArm, rightArmRot, 0, 8);
          }
        }
      },
      {
        name: 'head',
        x: 0, y: headY, z: 0,
        draw: () => {
          if (this.visibleParts.head) {
            this.drawCuboid(ctx, 0, headY, 16, 16, 16, this.yaw, this.pitch, uvHead, colorHead, breathing * 0.5, 0, -4);
          }
        }
      }
    ];

    // Compute depth for each limb center
    parts.forEach(p => {
      const proj = this.project(p.x, p.y, p.z, this.yaw, this.pitch);
      p.depth = proj.z;
    });

    // Sort from back to front (largest Z to smallest Z)
    parts.sort((a, b) => b.depth - a.depth);

    // Draw sorted limbs
    parts.forEach(p => p.draw());
 
    ctx.restore();
  }
}
