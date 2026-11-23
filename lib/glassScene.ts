import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MARK_BOX, SHARDS, SHARD_BOX, type ShardId } from "./mark";

/**
 * The Skepper mark as nine pieces of cut glass in a white room.
 *
 * state.intro   0 → 1  the pieces arrive and lock together
 * state.travel  0 → 1  the mark leaves the centre of the room for the story column
 * state.step    0 → 8  which piece is in front of the visitor
 */
export type GlassScene = {
  state: { intro: number; travel: number; step: number };
  /** Resolves once every material is compiled, so the first frame shown is a smooth one. */
  ready: Promise<unknown>;
  setLayout: (l: Layout) => void;
  setActive: (on: boolean) => void;
  /** Paints the room; the glass bends whatever colour is behind it. */
  setRoom: (r: number, g: number, b: number) => void;
  dispose: () => void;
};
export type Layout = {
  mark: { x: number; y: number; size: number };
  focus: { x: number; y: number; size: number };
  /** Which way the pieces travel past the visitor. */
  flow?: "x" | "y";
};

const FOV = 26;
const DIST = 12;
const H = 2 * DIST * Math.tan((FOV * Math.PI) / 360);
export const WALL_COLOR = "#f4f3f0";

/** How far light gets into each colour of glass; tuned so every piece keeps its brand hue. */
const CLARITY: Record<ShardId, number> = { purple: 1.5, yellow: 0.85, redTop: 0.62, redLow: 0.62, orange: 0.85, blueRight: 0.85, blueLeft: 0.85, lime: 0.85, navy: 1.35 };

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = THREE.MathUtils.lerp;

/** A photographer's white room: big soft lights, two dark flags to draw the edges of the glass. */
function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const room = new THREE.Scene();
  const add = (w: number, h: number, pos: [number, number, number], level: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(level, level, level), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    room.add(m);
  };
  room.background = new THREE.Color(0.82, 0.82, 0.81);
  add(7, 7, [6, 7, 5], 7);
  add(3, 10, [-9, 2, 3], 4.5);
  add(10, 2, [0, -7, 4], 2.2);
  add(1.6, 9, [4.5, 0, 9], 5);
  add(2.4, 12, [-6, 0, -8], 0.12);
  add(1.2, 10, [-3, 0, 9], 0.16);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(room, 0, 0.1, 100, { size: 128 }).texture;
  pmrem.dispose();
  room.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return tex;
}

/** Rolled glass is never perfectly flat: a soft ripple that bends what is seen through it. */
function rippleMap() {
  const n = 128;
  const h = new Float32Array(n * n);
  // A few random waves that tile.
  const waves = Array.from({ length: 14 }, (_, i) => ({ fx: ((i * 7) % 5) - 2, fy: ((i * 11) % 7) - 3, p: i * 2.4, a: 1 / (1 + (i % 5)) }));
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) for (const w of waves) h[y * n + x] += w.a * Math.sin(((x * w.fx + y * w.fy) / n) * Math.PI * 2 + w.p);
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const dx = h[y * n + ((x + 1) % n)] - h[y * n + ((x + n - 1) % n)];
      const dy = h[((y + 1) % n) * n + x] - h[((y + n - 1) % n) * n + x];
      const l = Math.hypot(dx * 5, dy * 5, 1);
      data.set([((-dx * 5) / l) * 127 + 128, ((-dy * 5) / l) * 127 + 128, 127 / l + 128, 255], (y * n + x) * 4);
    }
  const tex = new THREE.DataTexture(data, n, n);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.repeat.set(1 / 78, 1 / 78);
  tex.needsUpdate = true;
  return tex;
}

export function createGlassScene(canvas: HTMLCanvasElement): GlassScene {
  const small = window.innerWidth < 900;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.6 : 2));
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.debug.checkShaderErrors = false; // reading errors back stalls the first frame
  renderer.transmissionResolutionScale = small ? 0.5 : 0.8;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(WALL_COLOR);
  const env = studioEnvironment(renderer);
  scene.environment = env;
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(4, 6, 6);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.z = DIST;

  const ripple = rippleMap();
  const loader = new SVGLoader();
  const unit = H / MARK_BOX.h;
  const cx = MARK_BOX.w / 2;
  const cy = MARK_BOX.h / 2;

  const pieces = SHARDS.map((s, i) => {
    const [bx, by, bw, bh] = SHARD_BOX[s.id];
    const mx = bx + bw / 2;
    const my = by + bh / 2;
    const base = new THREE.Color(s.color);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 1,
      ior: 1.52,
      roughness: 0.03,
      normalMap: ripple,
      normalScale: new THREE.Vector2(0.085, 0.085),
      metalness: 0,
      attenuationColor: base,
      attenuationDistance: CLARITY[s.id],
      specularIntensity: 1,
      envMapIntensity: 0.95,
    });
    // Cut edges are polished: no ripple, so curves stay clean.
    const edge = material.clone();
    edge.normalScale = new THREE.Vector2(0, 0); // same shader as the faces, so only one has to compile
    const group = new THREE.Group();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">${s.paths.map((p) => `<path d="${p.d}" transform="translate(${p.x} ${p.y})"/>`).join("")}</svg>`;
    for (const path of loader.parse(svg).paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 9, bevelEnabled: true, bevelThickness: 1.1, bevelSize: 0.85, bevelOffset: -0.85, bevelSegments: 2, curveSegments: 30 });
        geo.translate(-mx, -my, -4.5);
        geo.scale(unit, -unit, unit);
        // The flip turns every triangle inside out; swapping two corners puts the winding back.
        const at = geo.attributes.position as THREE.BufferAttribute;
        for (let k = 0; k < at.count; k += 3)
          for (let c = 0; c < 3; c++) {
            const t = at.getComponent(k, c);
            at.setComponent(k, c, at.getComponent(k + 1, c));
            at.setComponent(k + 1, c, t);
          }
        group.add(new THREE.Mesh(toCreasedNormals(geo, 0.5), [material, edge]));
        geo.dispose();
      }
    }
    scene.add(group);

    const home = new THREE.Vector2((mx - cx) * unit, -(my - cy) * unit);
    return { id: s.id, i, group, material, edge, home, away: new THREE.Vector3(home.x, home.y, 0).normalize(), longest: Math.max(bw, bh) * unit, seed: i * 1.9 };
  });
  // The order the story visits them, matching the department list.
  const ORDER: ShardId[] = ["purple", "yellow", "redTop", "orange", "blueRight", "lime", "blueLeft", "navy", "redLow"];
  const rank = new Map(ORDER.map((id, n) => [id, n]));

  let layout: Layout | null = null;
  let active = true;
  let compiled = false;
  let raf = 0;
  let aspect = 1;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const state = { intro: 0, travel: 0, step: 0 };
  const world = (px: number, py: number) => [(px / 100 - 0.5) * H * aspect, (0.5 - py / 100) * H] as const;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!compiled || !active || !layout) return;
    const t = now / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    const [ox, oy] = world(layout.mark.x, layout.mark.y);
    const [fx, fy] = world(layout.focus.x, layout.focus.y);
    const k = layout.mark.size;
    const n = pieces.length;

    for (const p of pieces) {
      const order = rank.get(p.id)!;
      const arrive = 1 - Math.pow(1 - clamp01(state.intro * 1.5 - (p.i / n) * 0.5), 4);
      const local = smooth(clamp01(state.travel * 1.45 - (order / n) * 0.45));
      const whole = 1 - local;

      // Together: one body, turning a little with the pointer.
      const rx = (-pointer.y * 0.16 + Math.sin(t * 0.42) * 0.035) * whole;
      const ry = (-0.2 + pointer.x * 0.3 + Math.sin(t * 0.34) * 0.09) * whole;
      const hx = p.home.x * k * Math.cos(ry);
      const hy = p.home.y * k * Math.cos(rx);
      const hz = -p.home.x * k * Math.sin(ry) + p.home.y * k * Math.sin(rx);
      const gap = (1 - arrive) * 4.2;

      // Apart: a slow vertical procession through the focus point.
      const d = order - state.step;
      const near = Math.exp(-d * d * 2.2);
      const fk = (layout.focus.size * H) / p.longest;
      const across = layout.flow === "x";
      const sx = across ? fx + d * H * aspect * 0.85 : fx + Math.sign(d) * Math.min(Math.abs(d), 1) * 0.35;
      const sy = across ? fy : fy - d * H * 0.86;

      const x = lerp(ox + hx + p.away.x * gap, sx, local);
      const y = lerp(oy + hy + p.away.y * gap, sy + Math.sin(t * 0.7 + p.seed) * 0.06 * near, local);
      const z = lerp(hz + (1 - arrive) * (p.i % 2 ? 2.4 : -0.6), near * 0.5, local) + Math.sin(local * Math.PI) * 1.4;
      const scale = lerp(k, fk, local);
      p.group.position.set(x, y, z);
      p.group.scale.set(scale, scale, lerp(k, Math.min(fk, k * 1.15), local));
      p.group.rotation.set(
        rx + (1 - arrive) * 1.1 + local * (Math.sin(t * 0.45 + p.seed) * 0.1 - pointer.y * 0.12 - d * 0.35),
        ry + (1 - arrive) * 1.5 + local * (-0.42 + Math.sin(t * 0.4 + p.seed) * 0.2 + pointer.x * 0.25 + d * 0.7) + Math.sin(local * Math.PI) * 1.1,
        (1 - arrive) * (p.i % 2 ? 0.7 : -0.7),
      );
      p.group.visible = Math.abs(y) < H * 1.15 && Math.abs(x) < H * aspect * 1.2;

    }
    renderer.render(scene, camera);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    aspect = r.width / r.height;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }
  const onMove = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  raf = requestAnimationFrame(frame);

  const ready = renderer.compileAsync(scene, camera).catch(() => null).then(() => {
    compiled = true;
  });

  return {
    state,
    ready,
    setLayout: (l) => {
      layout = l;
    },
    setRoom: (r, g, b) => {
      (scene.background as THREE.Color).setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    },
    setActive: (on) => {
      active = on;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      pieces.forEach((p) => {
        p.material.dispose();
        p.edge.dispose();
        p.group.children.forEach((m) => (m as THREE.Mesh).geometry.dispose());
      });
      ripple.dispose();
      env.dispose();
      renderer.dispose();
    },
  };
}
