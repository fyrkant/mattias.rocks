type Vec3 = [number, number, number];
type Color = [number, number, number];
type Profile = [number, number][];

interface Face {
  v: number[];
  c: Color;
}

interface Mesh {
  verts: Vec3[];
  faces: Face[];
}

interface ProjectedFace {
  pv: Vec3[];
  wv: Vec3[];
  c: Color;
  depth: number;
}

(() => {
  const canvas = document.getElementById("mt-fuji") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;

  const canvasMini = document.getElementById("mt-fuji-mini") as HTMLCanvasElement | null;
  const ctxMini = canvasMini?.getContext("2d") ?? null;

  const canvasFly = document.createElement("canvas");
  canvasFly.id = "mt-fuji-fly";
  canvasFly.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvasFly);
  const ctxFly = canvasFly.getContext("2d")!;
  let Wf = 0;
  let Hf = 0;

  const SEGS = 9;
  let rotY = 0;
  let W = 1;
  let H = 1;
  let Wm = 1;
  let Hm = 1;

  let dragging = false;
  let lastX = 0;
  const BASE_VELOCITY = 0.006;
  let velocity = BASE_VELOCITY;

  function resize(): void {
    W = Math.max(1, Math.round(canvas!.clientWidth * 0.5));
    H = Math.max(1, Math.round(canvas!.clientHeight * 0.5));
    canvas!.width = W;
    canvas!.height = H;

    if (canvasMini) {
      Wm = Math.max(1, canvasMini.clientWidth);
      Hm = Math.max(1, canvasMini.clientHeight);
      canvasMini.width = Wm;
      canvasMini.height = Hm;
    }
  }
  resize();
  window.addEventListener("resize", resize);

  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function norm3([x, y, z]: Vec3): Vec3 {
    const l = Math.sqrt(x * x + y * y + z * z) || 1;
    return [x / l, y / l, z / l];
  }

  function cross3([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 {
    return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
  }

  function dot3([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): number {
    return ax * bx + ay * by + az * bz;
  }

  const EYE: Vec3 = [0, 3, 12];
  const FWD = norm3([0, 2 - 3, 0 - 12] as Vec3);
  const RIGHT = norm3(cross3(FWD, [0, 1, 0]));
  const UP = cross3(RIGHT, FWD);
  const HALF_TAN = Math.tan((25 * Math.PI) / 180);

  const SUN: Vec3 = norm3([5, 8, 3]);
  const AMB: Vec3 = [(0x33 / 255) * 0.8, (0x44 / 255) * 0.8, (0x77 / 255) * 0.8];
  const SUN_C: Vec3 = [(0xff / 255) * 1.2, (0xd0 / 255) * 1.2, (0xa0 / 255) * 1.2];

  const stars: Vec3[] = Array.from(
    { length: 60 },
    () =>
      [
        (Math.random() - 0.5) * 50,
        Math.random() * 20 + 2,
        (Math.random() - 0.5) * 50 - 15,
      ] as Vec3
  );

  function project(wx: number, wy: number, wz: number, w: number, h: number): Vec3 | null {
    const d: Vec3 = [wx - EYE[0], wy - EYE[1], wz - EYE[2]];
    const cx = dot3(d, RIGHT);
    const cy = dot3(d, UP);
    const cz = dot3(d, FWD);
    if (cz < 0.01) return null;
    const f = (h * 0.5) / HALF_TAN;
    return [cx / cz * f + w * 0.5, -cy / cz * f + h * 0.5, cz];
  }

  function rotPt([px, py, pz]: Vec3, ry: number): Vec3 {
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    return [c * px + s * pz, py, -s * px + c * pz];
  }

  function shade(base: Color, wv: Vec3[]): string {
    const ab: Vec3 = [wv[1][0] - wv[0][0], wv[1][1] - wv[0][1], wv[1][2] - wv[0][2]];
    const ac: Vec3 = [wv[2][0] - wv[0][0], wv[2][1] - wv[0][1], wv[2][2] - wv[0][2]];
    const n = norm3(cross3(ab, ac));
    const d = Math.max(0, dot3(n, SUN));
    const ch = (b: number, sunC: number, amb: number): number =>
      Math.round(Math.min(255, (b / 255) * (amb + d * sunC) * 255));
    return `rgb(${ch(base[0], SUN_C[0], AMB[0])},${ch(base[1], SUN_C[1], AMB[1])},${ch(base[2], SUN_C[2], AMB[2])})`;
  }

  function buildLathe(prof: Profile, col: Color, capTop = false): Mesh {
    const verts: Vec3[] = [];
    const faces: Face[] = [];
    const pn = prof.length;
    for (let seg = 0; seg <= SEGS; seg++) {
      const ang = (seg / SEGS) * Math.PI * 2;
      for (let pi = 0; pi < pn; pi++)
        verts.push([prof[pi][0] * Math.cos(ang), prof[pi][1], prof[pi][0] * Math.sin(ang)]);
    }
    for (let seg = 0; seg < SEGS; seg++)
      for (let pi = 0; pi < pn - 1; pi++) {
        const va = seg * pn + pi;
        const vb = seg * pn + pi + 1;
        const vc = (seg + 1) * pn + pi + 1;
        const vd = (seg + 1) * pn + pi;
        faces.push({ v: [va, vb, vc, vd], c: col });
      }
    if (capTop) {
      const topY = prof[pn - 1][1];
      const ci = verts.length;
      verts.push([0, topY, 0]);
      for (let seg = 0; seg < SEGS; seg++) {
        const nxt = (seg + 1) % SEGS;
        faces.push({ v: [ci, nxt * pn + (pn - 1), seg * pn + (pn - 1)], c: col });
      }
    }
    return { verts, faces };
  }

  function buildCylinder(rT: number, rB: number, h: number, col: Color): Mesh {
    const verts: Vec3[] = [];
    const faces: Face[] = [];
    for (let seg = 0; seg <= SEGS; seg++) {
      const ang = (seg / SEGS) * Math.PI * 2;
      verts.push([rT * Math.cos(ang), h * 0.5, rT * Math.sin(ang)]);
      verts.push([rB * Math.cos(ang), -h * 0.5, rB * Math.sin(ang)]);
    }
    for (let seg = 0; seg < SEGS; seg++)
      faces.push({ v: [seg * 2, (seg + 1) * 2, (seg + 1) * 2 + 1, seg * 2 + 1], c: col });
    const ci = verts.length;
    verts.push([0, h * 0.5, 0]);
    for (let seg = 0; seg < SEGS; seg++) {
      const nxt = (seg + 1) % SEGS;
      faces.push({ v: [ci, nxt * 2, seg * 2], c: col });
    }
    return { verts, faces };
  }

  const LOWER: Profile = [[4.5, 0], [4.3, 0.3], [3.8, 0.8], [3.1, 1.5], [2.3, 2.3], [1.6, 3.1]];
  const UPPER: Profile = [[1.6, 3.1], [1.0, 3.8], [0.4, 4.5]];
  const MESHES: Mesh[] = [
    buildLathe(LOWER, [42, 46, 58]),
    buildLathe(UPPER, [228, 234, 242], true),
    buildCylinder(4.8, 5.1, 0.4, [32, 58, 32]),
  ];

  function renderTo(targetCtx: CanvasRenderingContext2D, w: number, h: number): void {
    targetCtx.fillStyle = "#1a2744";
    targetCtx.fillRect(0, 0, w, h);

    targetCtx.fillStyle = "rgba(255,255,255,0.85)";
    for (const [sx, sy, sz] of stars) {
      const p = project(sx, sy, sz, w, h);
      if (p) targetCtx.fillRect(Math.round(p[0]), Math.round(p[1]), 1, 1);
    }

    const allFaces: ProjectedFace[] = [];
    for (const mesh of MESHES) {
      for (const face of mesh.faces) {
        const wv = face.v.map((i) => rotPt(mesh.verts[i], rotY));
        const pvRaw = wv.map((v) => project(v[0], v[1], v[2], w, h));
        if (pvRaw.some((p) => p === null)) continue;
        const pv = pvRaw as Vec3[];
        const depth = pv.reduce((s, p) => s + p[2], 0) / pv.length;
        allFaces.push({ pv, wv, c: face.c, depth });
      }
    }

    allFaces.sort((a, b) => b.depth - a.depth);
    for (const f of allFaces) {
      targetCtx.fillStyle = shade(f.c, f.wv);
      targetCtx.beginPath();
      targetCtx.moveTo(f.pv[0][0], f.pv[0][1]);
      for (let i = 1; i < f.pv.length; i++) targetCtx.lineTo(f.pv[i][0], f.pv[i][1]);
      targetCtx.closePath();
      targetCtx.fill();
    }
  }

  function clientX(e: MouseEvent | TouchEvent): number {
    return "touches" in e ? e.touches[0].clientX : e.clientX;
  }

  canvas.style.cursor = "grab";

  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    lastX = clientX(e);
    canvas!.style.cursor = "grabbing";
  });
  canvas.addEventListener("touchstart", (e) => {
    dragging = true;
    lastX = clientX(e);
    e.preventDefault();
  }, { passive: false });

  function onMove(e: MouseEvent | TouchEvent): void {
    if (!dragging) return;
    const x = clientX(e);
    const dx = x - lastX;
    const scaledDx = dx / W;
    velocity = scaledDx * Math.PI * 2;
    rotY += velocity;
    lastX = x;
  }
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("touchmove", onMove, { passive: false });

  function onEnd(): void {
    dragging = false;
    canvas!.style.cursor = "grab";
  }
  window.addEventListener("mouseup", onEnd);
  window.addEventListener("touchend", onEnd);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // For reduced-motion users: toggle sticky class via IntersectionObserver + CSS fade
  const nav = document.querySelector("nav");
  if (reducedMotion && nav && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        nav.classList.toggle("fuji-sticky", !entries[0].isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(canvas);
  }

  function loop(): void {
    if (!reducedMotion) requestAnimationFrame(loop);
    if (!dragging && !reducedMotion) {
      rotY += velocity;
      velocity += (BASE_VELOCITY - velocity) * 0.02;
    }
    renderTo(ctx, W, H);
    if (ctxMini) renderTo(ctxMini, Wm, Hm);

    if (!reducedMotion && canvasMini) {
      const heroRect = canvas.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -heroRect.top / heroRect.height));

      // Fade hero out quickly as it scrolls off so fly canvas can take over cleanly
      canvas.style.opacity = String(Math.max(0, 1 - progress * 6));

      if (progress > 0 && progress < 1) {
        const miniRect = canvasMini.getBoundingClientRect();
        const ease = easeInOut(progress);

        const newWf = Math.round(lerp(heroRect.width, miniRect.width, ease));
        const newHf = Math.round(lerp(heroRect.height, miniRect.height, ease));
        const top = lerp(0, miniRect.top, ease);
        const left = lerp(heroRect.left, miniRect.left, ease);
        const radius = lerp(0, 6, ease);

        canvasFly.style.display = "block";
        canvasFly.style.top = `${top}px`;
        canvasFly.style.left = `${left}px`;
        canvasFly.style.width = `${newWf}px`;
        canvasFly.style.height = `${newHf}px`;
        canvasFly.style.borderRadius = `${radius}px`;

        if (newWf !== Wf || newHf !== Hf) {
          Wf = newWf;
          Hf = newHf;
          canvasFly.width = Wf;
          canvasFly.height = Hf;
        }
        renderTo(ctxFly, Wf, Hf);

        (canvasMini as HTMLCanvasElement).style.opacity = "0";
      } else {
        canvasFly.style.display = "none";
        (canvasMini as HTMLCanvasElement).style.opacity = progress >= 1 ? "1" : "0";
        if (progress === 0) canvas.style.opacity = "1";
      }
    }
  }
  loop();
})();
