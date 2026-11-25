'use strict';
/* =========================================================
   העולם שלי — game engine
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const WALK_MIN = FT + 45, FB = 880;
const depth = (y) => 0.74 + 0.36 * clamp((y - FT) / (900 - FT), 0, 1.2);
const CHAR_H = 330, ITEM_S = 74;

/* ---------------- sounds ---------------- */
let AC = null;
function snd(kind) {
  if (!state.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const t = AC.currentTime;
    const tone = (type, f0, f1, dur, vol = 0.18, delay = 0) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t + delay);
      o.frequency.exponentialRampToValueAtTime(f1, t + delay + dur);
      g.gain.setValueAtTime(vol, t + delay); g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.connect(g).connect(AC.destination); o.start(t + delay); o.stop(t + delay + dur + 0.02);
    };
    switch (kind) {
      case 'pop': tone('sine', 500, 1100, 0.12); break;
      case 'boing': tone('triangle', 220, 520, 0.18, 0.25); tone('triangle', 520, 260, 0.2, 0.2, 0.15); break;
      case 'tap': tone('sine', 700, 600, 0.06, 0.1); break;
      case 'hop': tone('square', 300, 800, 0.15, 0.07); break;
      case 'meow': tone('sawtooth', 600, 900, 0.18, 0.06); tone('sawtooth', 900, 500, 0.3, 0.06, 0.16); break;
      case 'woof': tone('square', 260, 160, 0.12, 0.12); tone('square', 260, 150, 0.14, 0.12, 0.18); break;
      case 'quack': tone('sawtooth', 500, 380, 0.14, 0.08); tone('sawtooth', 500, 360, 0.16, 0.08, 0.17); break;
      case 'oink': tone('square', 340, 220, 0.12, 0.08); tone('square', 320, 200, 0.12, 0.08, 0.16); break;
      case 'moo': tone('sawtooth', 160, 120, 0.7, 0.1); break;
      case 'cluck': [0, 0.12, 0.24].forEach(d => tone('square', 900, 700, 0.06, 0.06, d)); break;
      case 'baa': tone('sawtooth', 420, 380, 0.5, 0.08); break;
      case 'neigh': tone('sawtooth', 700, 1100, 0.2, 0.07); tone('sawtooth', 1000, 500, 0.4, 0.07, 0.18); break;
      case 'honk': tone('square', 420, 420, 0.18, 0.1); tone('square', 420, 420, 0.25, 0.1, 0.25); break;
      case 'chomp': [0, 0.22, 0.44].forEach(d => tone('square', 180, 90, 0.08, 0.1, d)); break;
      case 'whoosh': tone('sine', 900, 200, 0.35, 0.12); break;
      case 'flush': tone('triangle', 900, 120, 1.1, 0.15); tone('sine', 400, 80, 1.2, 0.1, 0.1); break;
      case 'splash': tone('triangle', 1200, 300, 0.3, 0.12); break;
      case 'ok': [523, 659, 784].forEach((f, i) => tone('sine', f, f, 0.25, 0.15, i * 0.09)); break;
      case 'click': tone('square', 1200, 900, 0.04, 0.05); break;
    }
  } catch (e) { /* no audio */ }
}

/* ---------------- state ---------------- */
const KEY = 'kidsworld-v3';
const living = ZONES.find(z => z.key === 'living');
let state = null;
try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
if (!state || !Array.isArray(state.chars)) {
  state = { chars: [], items: [], sel: null, sound: true, night: false, camX: living.x0 + 100 };
  let old = null;
  try { old = JSON.parse(localStorage.getItem('kidsworld-v2')) || JSON.parse(localStorage.getItem('kidsworld-v1')); } catch (e) { }
  const src = old && old.chars && old.chars.length ? old.chars.map(c => ({ name: c.name, look: c.look })) : [{ name: rnd(NAMES), look: randomLook() }, { name: rnd(NAMES), look: randomLook() }];
  src.forEach((c, i) => state.chars.push({ id: 'k' + Date.now() + i, name: c.name, look: c.look, x: living.x0 + 300 + (i % 5) * 230, y: 740 + (i % 2) * 70, seat: null }));
  state.sel = state.chars[0] && state.chars[0].id;
  let n = 0;
  ZONES.forEach(z => (z.items || []).forEach(([e, x, y]) => state.items.push({ id: 'i' + (n++), e, x: x + z.x0, y, holder: null })));
}
let saveT = 0;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { try { state.camX = camX; localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }, 300);
}
const charById = (id) => state.chars.find(c => c.id === id);
const itemById = (id) => state.items.find(i => i.id === id);

/* ---------------- DOM / camera ---------------- */
const stage = $('#stage'), bgL = $('#bgLayer'), layer = $('#layer'), fxEl = $('#fx');
let scale = 1, viewW = 1600, camX = state.camX || 0, camV = 0, camTarget = null;

function buildWorld() {
  stage.style.width = WORLD_W + 'px';
  bgL.innerHTML = ''; layer.innerHTML = '';
  for (const z of ZONES) {
    const d = document.createElement('div');
    d.className = 'zone'; d.style.left = z.x0 + 'px'; d.style.width = z.w + 'px';
    d.innerHTML = `<svg viewBox="0 0 ${z.w} 900" xmlns="http://www.w3.org/2000/svg">${z.draw(z.w)}</svg>`;
    bgL.appendChild(d);
    z.els = [d];
    for (const f of z.fronts || []) {
      const fd = document.createElement('div');
      fd.className = 'front'; fd.style.left = z.x0 + 'px'; fd.style.width = z.w + 'px'; fd.style.zIndex = f.z;
      fd.innerHTML = `<svg viewBox="0 0 ${z.w} 900" xmlns="http://www.w3.org/2000/svg">${f.svg}</svg>`;
      layer.appendChild(fd);
      z.els.push(fd);
    }
  }
  for (const c of state.chars) addCharEl(c);
  for (const it of state.items) addItemEl(it);
  stage.classList.toggle('night', !!state.night);
}

function layout() {
  const vw = innerWidth, vh = innerHeight;
  scale = vh / 900;
  viewW = vw / scale;
  stage.style.transformOrigin = '0 0';
  applyCam();
}
function applyCam() {
  camX = clamp(camX, 0, Math.max(0, WORLD_W - viewW));
  stage.style.transform = `translate(${(-camX * scale).toFixed(2)}px,0) scale(${scale})`;
  // only places near the screen are rendered (keeps a long world smooth)
  for (const z of ZONES) {
    const on = z.x0 + z.w > camX - 500 && z.x0 < camX + viewW + 500;
    if (z.on !== on) { z.on = on; (z.els || []).forEach(el => el.classList.toggle('off', !on)); }
  }
}
const toStage = (cx, cy) => ({ x: cx / scale + camX, y: cy / scale });
function panTo(x) { camTarget = clamp(x - viewW / 2, 0, WORLD_W - viewW); camV = 0; }

/* ---------------- characters ---------------- */
const rt = {};      // char runtime
const irt = {};     // item runtime
function poseOf(c) { const s = c.seat && seatById(c.seat); return s ? (s.kind === 'lie' ? 'lie' : 'sit') : 'stand'; }

function addCharEl(c) {
  const el = document.createElement('div');
  el.className = 'char';
  el.dataset.id = c.id;
  el.innerHTML = `<div class="shadow"></div><div class="pose"><div class="art"></div><div class="hand"></div></div><div class="name"></div>`;
  el.querySelector('.name').textContent = c.name;
  layer.appendChild(el);
  rt[c.id] = { el, art: el.querySelector('.art'), hand: el.querySelector('.hand'), pose: el.querySelector('.pose'), expr: '', tx: null, ty: null, fallTo: null, vy: 0, held: false, exprT: 0 };
  if (c.seat && !seatById(c.seat)) c.seat = null;
  if (!c.seat) { c.y = clamp(c.y, WALK_MIN, FB); c.x = clamp(c.x, 40, WORLD_W - 40); }
  drawChar(c); place(c);
  el.classList.toggle('sel', state.sel === c.id);
  return rt[c.id];
}
function removeCharEl(id) { if (rt[id]) { rt[id].el.remove(); delete rt[id]; } }

function baseExpr(c) {
  const s = c.seat && seatById(c.seat);
  return s && s.bed ? 'sleep' : '';
}
function drawChar(c) {
  const r = rt[c.id]; if (!r) return;
  const pose = r.held ? 'stand' : poseOf(c);
  const expr = r.expr || (r.held ? 'surprised' : baseExpr(c));
  const key = pose + '|' + expr + '|' + JSON.stringify(c.look);
  if (r.drawn === key) return;
  r.drawn = key;
  r.art.innerHTML = charSVG(c.look, { pose, expr });
  r.el.dataset.pose = pose;
}
function setExpr(c, e, ms) {
  const r = rt[c.id]; if (!r) return;
  r.expr = e; drawChar(c);
  clearTimeout(r.exprT);
  if (ms) r.exprT = setTimeout(() => { r.expr = ''; drawChar(c); }, ms);
}

function geom(c) {
  const r = rt[c.id];
  const seat = !r.held && c.seat && seatById(c.seat);
  const sc = seat ? seat.scale : depth(c.y);
  const H = CHAR_H * sc, w = H / 2;
  const pose = seat ? (seat.kind === 'lie' ? 'lie' : 'sit') : 'stand';
  const px = seat ? seat.x : c.x, py = seat ? seat.y : c.y;
  // anchor in unscaled element units (element is CHAR_H/2 × CHAR_H)
  const bay = pose === 'stand' ? CHAR_H * 236 / 240 : pose === 'sit' ? CHAR_H * 172 / 240 : CHAR_H / 2;
  return { H, w, sc, pose, px, py, ax: w / 2, ay: bay * sc, bax: CHAR_H / 4, bay, seat };
}
function place(c) {
  const r = rt[c.id]; if (!r) return;
  const g = geom(c);
  r.el.style.transform = `translate(${(g.px - g.bax * g.sc).toFixed(1)}px,${(g.py - g.bay * g.sc).toFixed(1)}px) scale(${g.sc.toFixed(4)})`;
  r.el.style.zIndex = r.held ? 5000 : g.seat ? g.seat.z : Math.round(g.py);
  if (g.seat && g.seat.kind === 'swing') r.pose.style.transformOrigin = `${g.bax}px ${g.bay - (g.py - g.seat.bar) / g.sc}px`;
  else r.pose.style.transformOrigin = '';
}
// smooth hop into / out of a seat
function tween(c) { const r = rt[c.id]; if (!r) return; r.el.classList.add('tween'); clearTimeout(r.twT); r.twT = setTimeout(() => r.el.classList.remove('tween'), 320); }

function select(id) {
  state.sel = id;
  for (const k in rt) rt[k].el.classList.toggle('sel', k === id);
  renderTray();
  save();
}
function bounce(el, cls = 'hop') { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function standUp(c) {
  const s = c.seat && seatById(c.seat);
  if (!s) return;
  c.seat = null;
  c.x = s.x; c.y = clamp(Math.max(s.y + 60, s.z + 10), WALK_MIN, FB);
  const r = rt[c.id]; if (r) r.pose.classList.remove('swinging');
  tween(c); drawChar(c); place(c);
}
function walkTo(c, x, y) {
  const r = rt[c.id]; if (!r) return;
  if (c.seat) standUp(c);
  r.tx = clamp(x, 40, WORLD_W - 40); r.ty = clamp(y, WALK_MIN, FB);
  r.el.classList.remove('wave', 'look');
  r.el.classList.add('walking');
}
function freeSeatNear(x, y, exceptId) {
  let best = null, bd = 150;
  for (const s of SEATS) {
    if (state.chars.some(o => o.seat === s.id && o.id !== exceptId)) continue;
    const d = Math.hypot(s.x - x, (s.y - y) * (s.kind === 'lie' ? 0.8 : 1));
    if (d < (s.kind === 'lie' ? 220 : bd) && (!best || d < best.d)) best = { s, d };
  }
  return best && best.s;
}

/* ---------------- items ---------------- */
function addItemEl(it) {
  const el = document.createElement('div');
  el.className = 'item'; el.dataset.id = it.id; el.textContent = it.e;
  irt[it.id] = { el, fallTo: null, vy: 0, held: false };
  if (it.holder && rt[it.holder]) rt[it.holder].hand.appendChild(el);
  else { it.holder = null; layer.appendChild(el); }
  placeItem(it);
  return irt[it.id];
}
function itemScale(it) { return it.s || depth(it.y); }
function placeItem(it) {
  const r = irt[it.id]; if (!r) return;
  const el = r.el;
  if (it.holder) { el.style.transform = ''; el.style.zIndex = ''; return; }
  const s = r.held ? Math.max(itemScale(it), 0.9) : itemScale(it), size = ITEM_S * s;
  el.style.transform = `translate(${(it.x - size * 0.6).toFixed(1)}px,${(it.y - size * 1.15).toFixed(1)}px) scale(${s.toFixed(4)})`;
  el.style.zIndex = r.held ? 5001 : Math.round(it.y) + 1;
}
function removeItem(it) {
  const r = irt[it.id];
  if (r) r.el.remove();
  delete irt[it.id];
  state.items = state.items.filter(x => x !== it);
  save();
}
function settleItem(it, x, y) {
  // fall onto the first surface below, or the floor
  it.x = clamp(x, 30, WORLD_W - 30); it.y = y; it.s = 0;
  let target = null;
  for (const s of SURFACES) if (it.x >= s.x1 && it.x <= s.x2 && s.y >= y - 30 && (!target || s.y < target.y)) target = s;
  const r = irt[it.id];
  if (target) { r.fallTo = target.y; it.surf = target.scale; }
  else if (y < WALK_MIN) { r.fallTo = WALK_MIN + 10 + Math.random() * 90; it.surf = 0; }
  else { it.y = Math.min(y, FB); it.surf = 0; placeItem(it); save(); return; }
  r.vy = 0;
}
function spawnItem(e, x, y) {
  const live = state.items.filter(i => !i.holder);
  if (live.length > 45) removeItem(live[0]);
  const it = { id: 'i' + Date.now() + Math.floor(Math.random() * 1000), e, x, y, holder: null };
  state.items.push(it);
  addItemEl(it);
  settleItem(it, x, y);
  return it;
}
function giveItem(c, it) {
  const r = rt[c.id]; if (!r) return;
  const prev = state.items.find(i => i.holder === c.id && i !== it);
  if (prev) dropFromHand(prev, c);
  it.holder = c.id; it.s = 0;
  r.hand.appendChild(irt[it.id].el);
  placeItem(it);
  snd('pop'); save();
}
function dropFromHand(it, c) {
  const g = geom(c);
  it.holder = null;
  layer.appendChild(irt[it.id].el);
  settleItem(it, g.px + g.w * 0.25, g.py - g.H * 0.3);
}
function eat(c, it) {
  const r = rt[c.id]; if (!r || r.eating) return;
  r.eating = true;
  if (it.holder !== c.id) giveItem(c, it);
  const el = irt[it.id] && irt[it.id].el;
  setExpr(c, 'eat');
  r.el.classList.add('eating');
  snd('chomp');
  let bites = 0;
  const bite = () => {
    if (!r.eating || it.holder !== c.id) return;
    bites++;
    if (el) el.style.setProperty('--bite', 1 - bites * 0.28);
    if (bites < 3) { setTimeout(bite, 450); return; }
    removeItem(it);
    r.eating = false;
    r.el.classList.remove('eating');
    setExpr(c, 'yum', 1400);
    const g = geom(c);
    bubble(g.px, g.py - g.ay - 10, rnd(['😋', '😋', '❤️', 'יאמי!']));
  };
  el && el.classList.add('eating');
  setTimeout(bite, 450);
}
function petEat(pet, food) {
  removeItem(food);
  bounce(irt[pet.id].el, 'boing');
  hearts(pet.x, pet.y - 60);
  snd(PETS[pet.e] || 'pop');
}

/* ---------------- tray ---------------- */
function renderTray() {
  const tray = $('#tray');
  tray.innerHTML = '';
  for (const c of state.chars) {
    const b = document.createElement('button');
    b.className = 'face' + (c.id === state.sel ? ' sel' : '');
    b.innerHTML = charSVG(c.look, { vb: '8 0 104 104' });
    b.addEventListener('click', () => {
      select(c.id);
      const g = geom(c);
      panTo(g.px);
      bounce(rt[c.id].el); snd('hop');
    });
    tray.appendChild(b);
  }
  const add = document.createElement('button');
  add.className = 'face add'; add.textContent = '+';
  add.addEventListener('click', () => openCreator(null));
  tray.appendChild(add);
}

/* ---------------- main loop ---------------- */
let last = performance.now();
const drags = new Map();
function tick(t) {
  const dt = Math.min(0.06, (t - last) / 1000); last = t;
  // camera: auto-pan while dragging near the screen edge, inertia, smooth pan-to
  let edge = 0;
  for (const d of drags.values()) if (d.moved && (d.kind === 'char' || d.kind === 'item')) {
    if (d.cx < 90) edge = -1; else if (d.cx > innerWidth - 90) edge = 1;
  }
  if (edge) { camX += edge * 900 * dt; camTarget = null; }
  else if (camTarget != null) { camX += (camTarget - camX) * Math.min(1, dt * 6); if (Math.abs(camTarget - camX) < 1) camTarget = null; }
  else if (Math.abs(camV) > 5 && ![...drags.values()].some(d => d.kind === 'pan')) { camX += camV * dt; camV *= Math.pow(0.04, dt); }
  applyCam();
  if (edge) for (const d of drags.values()) if (d.moved) moveDrag(d);

  for (const c of state.chars) {
    const r = rt[c.id];
    if (!r) continue;
    // carried: the body swings like a pendulum from the hand that holds it
    if (r.held || Math.abs(r.tilt || 0) > 0.2) {
      r.tiltV = (r.tiltV || 0) + (-(r.tilt || 0) * 60 - (r.tiltV || 0) * 7) * dt;
      r.tilt = clamp((r.tilt || 0) + r.tiltV * dt, -35, 35);
      r.art.style.rotate = r.tilt.toFixed(2) + 'deg';
    } else if (r.art.style.rotate) r.art.style.rotate = '';
    if (r.held) continue;
    if (r.fallTo != null) {
      r.vy += 2800 * dt; c.y += r.vy * dt;
      if (c.y >= r.fallTo) { c.y = r.fallTo; r.fallTo = null; r.vy = 0; bounce(r.el, 'land'); snd('tap'); save(); }
      place(c);
    } else if (r.tx != null) {
      // ease in at the start, ease out near the target
      r.walkT = (r.walkT || 0) + dt;
      const dx = r.tx - c.x, dy = r.ty - c.y, d = Math.hypot(dx, dy);
      const speed = 300 * (0.7 + 0.3 * depth(c.y)) * Math.min(1, 0.35 + r.walkT * 2.5) * Math.min(1, 0.35 + d / 90);
      const step = speed * dt;
      if (d <= Math.max(step, 2)) { c.x = r.tx; c.y = r.ty; r.tx = null; r.walkT = 0; r.el.classList.remove('walking'); r.idleT = 3 + Math.random() * 4; save(); }
      else { c.x += dx / d * step; c.y += dy / d * step; if (Math.abs(dx) > 6) r.el.classList.toggle('left', dx < 0); }
      place(c);
    } else if (!c.seat && !r.eating) {
      // idle life: every few seconds wave, look around or do a little jump
      r.idleT = (r.idleT == null ? 2 + Math.random() * 6 : r.idleT) - dt;
      if (r.idleT <= 0) {
        r.idleT = 5 + Math.random() * 7;
        const a = rnd(['wave', 'look', 'look', 'joy']);
        if (a === 'joy') bounce(r.el, 'hop'); else { r.el.classList.add(a); setTimeout(() => r.el.classList.remove(a), 1700); }
      }
    }
  }
  for (const it of state.items) {
    const r = irt[it.id];
    if (!r || r.held || r.fallTo == null) continue;
    r.vy += 2800 * dt; it.y += r.vy * dt;
    if (it.y >= r.fallTo) {
      it.y = r.fallTo; r.fallTo = null;
      if (r.vy > 600) { r.vy = -r.vy * 0.3; r.fallTo = it.y; it.y -= 1; } else { r.vy = 0; it.s = it.surf || 0; bounce(r.el, 'boing'); save(); }
    }
    placeItem(it);
  }
  requestAnimationFrame(tick);
}

/* ---------------- input ---------------- */
stage.addEventListener('pointerdown', (e) => {
  if (AC && AC.state === 'suspended') AC.resume();
  const chEl = e.target.closest('.char');
  const itEl = e.target.closest('.item');
  const prop = e.target.closest('.prop');
  let d;
  if (itEl) d = { kind: 'item', it: itemById(itEl.dataset.id) };
  else if (chEl) d = { kind: 'char', c: charById(chEl.dataset.id) };
  else if (prop) d = { kind: 'prop', prop };
  else d = { kind: 'bg' };
  if ((d.kind === 'item' && !d.it) || (d.kind === 'char' && !d.c)) return;
  Object.assign(d, { id: e.pointerId, sx: e.clientX, sy: e.clientY, cx: e.clientX, cy: e.clientY, moved: false, cam0: camX, lt: performance.now() });
  drags.set(e.pointerId, d);
  try { stage.setPointerCapture(e.pointerId); } catch (err) { }
  camTarget = null; camV = 0;
});

function startDrag(d) {
  if (d.kind === 'char') {
    const c = d.c, r = rt[c.id];
    const g = geom(c);
    if (c.seat) { c.x = g.px; c.y = g.py; c.seat = null; r.pose.classList.remove('swinging'); }
    r.held = true; r.tx = null; r.fallTo = null;
    r.el.classList.remove('walking'); r.el.classList.add('held');
    drawChar(c);
    if (state.sel !== c.id) select(c.id);
    snd('pop');
  } else if (d.kind === 'item') {
    const it = d.it, r = irt[it.id];
    if (it.holder) {
      const c = charById(it.holder);
      it.holder = null; layer.appendChild(r.el);
      if (c && rt[c.id] && rt[c.id].eating) { rt[c.id].eating = false; rt[c.id].el.classList.remove('eating'); setExpr(c, ''); }
    }
    r.held = true; r.fallTo = null; r.el.classList.add('held'); r.el.classList.remove('eating');
    snd('pop');
  } else {
    if ([...drags.values()].some(o => o !== d && o.kind === 'pan')) { d.kind = 'none'; return; }
    d.kind = 'pan';
  }
}
function moveDrag(d) {
  const p = toStage(d.cx, d.cy);
  if (d.kind === 'char') {
    const c = d.c, r = rt[c.id];
    const nx = clamp(p.x, 30, WORLD_W - 30);
    if (r) r.tiltV = (r.tiltV || 0) - (nx - c.x) * 2.2;   // moving sideways makes it swing
    c.x = nx;
    c.y = clamp(p.y + CHAR_H * depth(clamp(p.y, WALK_MIN, FB)) * 0.42, 130, FB);
    place(c);
  } else if (d.kind === 'item') {
    const it = d.it;
    it.x = clamp(p.x, 20, WORLD_W - 20); it.y = clamp(p.y + 30, 40, FB); it.s = 0;
    placeItem(it);
  }
}
stage.addEventListener('pointermove', (e) => {
  const d = drags.get(e.pointerId); if (!d) return;
  const now = performance.now();
  if (d.kind === 'pan' && d.moved) camV = -((e.clientX - d.cx) / scale) / Math.max(0.008, (now - d.lt) / 1000);
  d.cx = e.clientX; d.cy = e.clientY; d.lt = now;
  if (!d.moved && Math.hypot(d.cx - d.sx, d.cy - d.sy) > 12) { d.moved = true; startDrag(d); }
  if (!d.moved) return;
  if (d.kind === 'pan') { camX = d.cam0 - (d.cx - d.sx) / scale; applyCam(); }
  else moveDrag(d);
});

function endDrag(e) {
  const d = drags.get(e.pointerId); if (!d) return;
  drags.delete(e.pointerId);
  const p = toStage(e.clientX, e.clientY);
  if (!d.moved) {
    if (d.kind === 'char') tapChar(d.c);
    else if (d.kind === 'item') tapItem(d.it);
    else if (d.kind === 'prop') propTap(d.prop, p);
    else if (d.kind === 'bg') tapGround(p);
    return;
  }
  if (d.kind === 'pan') { if (performance.now() - d.lt > 80) camV = 0; save(); return; }
  if (d.kind === 'char') dropChar(d.c, p);
  if (d.kind === 'item') dropItem(d.it, e);
}
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);
document.addEventListener('contextmenu', (e) => e.preventDefault());

function tapGround(p) {
  const c = charById(state.sel);
  if (!c || !rt[c.id] || rt[c.id].fallTo != null) return;
  const g = geom(c);
  if (Math.abs(g.px - p.x) > viewW) return;
  walkTo(c, p.x, p.y);
  ring(p.x, clamp(p.y, WALK_MIN, FB));
  snd('click');
}
function tapChar(c) {
  const r = rt[c.id];
  select(c.id);
  const held = state.items.find(i => i.holder === c.id);
  if (held && isFood(held.e)) { eat(c, held); return; }
  const g = geom(c);
  if (g.pose === 'stand') bounce(r.el);
  setExpr(c, 'happy', 1200);
  bubble(g.px, g.py - g.ay - 10, rnd(['😀', '❤️', '🎵', '😍', '👋', '⭐', '😜', '🌈', 'היי!']));
  snd('hop');
}
function tapItem(it) {
  const r = irt[it.id];
  if (it.holder) { const c = charById(it.holder); if (c) tapChar(c); return; }
  if (PETS[it.e]) { bounce(r.el, 'boing'); hearts(it.x, it.y - ITEM_S * itemScale(it)); snd(PETS[it.e]); return; }
  if (it.e === '⚽' || it.e === '🎈') { r.vy = -1300; r.fallTo = it.y; it.y -= 1; snd('boing'); return; }
  bounce(r.el, 'boing'); snd('tap');
}
function dropChar(c, p) {
  const r = rt[c.id];
  r.held = false; r.el.classList.remove('held');
  const seat = freeSeatNear(p.x, p.y + 40, c.id);
  if (seat) {
    c.seat = seat.id;
    tween(c); drawChar(c); place(c);
    bounce(r.el, 'land');
    snd('pop');
    if (seat.bed) { const g = geom(c); bubble(g.px - 60, g.py - 90, '💤'); }
    save();
    return;
  }
  drawChar(c);
  if (c.y < WALK_MIN) { r.fallTo = WALK_MIN + 10 + Math.random() * 60; r.vy = 0; }
  else { place(c); bounce(r.el, 'land'); save(); }
}
function dropItem(it, e) {
  const r = irt[it.id];
  r.held = false; r.el.classList.remove('held');
  r.el.style.visibility = 'hidden';
  const under = document.elementsFromPoint(e.clientX, e.clientY);
  r.el.style.visibility = '';
  const p = toStage(e.clientX, e.clientY);
  // trash can?
  const trash = under.find(x => x.closest && x.closest('[data-prop="trash"]'));
  if (trash) { const tp = propCenter(trash.closest('.prop')); poof(tp.x, tp.top); removeItem(it); snd('whoosh'); bounce(trash.closest('.prop'), 'boing'); return; }
  // onto a pet?
  const petEl = under.map(x => x.closest && x.closest('.item')).find(x => x && x !== r.el);
  if (petEl) { const pet = itemById(petEl.dataset.id); if (pet && PETS[pet.e] && isFood(it.e)) { petEat(pet, it); return; } }
  // onto a character?
  const chEl = under.map(x => x.closest && x.closest('.char')).find(Boolean);
  if (chEl) {
    const c = charById(chEl.dataset.id);
    if (c) {
      const b = chEl.getBoundingClientRect();
      const g = geom(c);
      const headZone = g.pose === 'lie' ? (e.clientX < b.left + b.width * 0.45) : (e.clientY < b.top + b.height * (g.pose === 'sit' ? 0.5 : 0.42));
      if (headZone && isFood(it.e)) eat(c, it);
      else giveItem(c, it);
      return;
    }
  }
  settleItem(it, p.x, p.y + 30);
}

/* ---------------- effects ---------------- */
function ring(x, y) {
  const el = document.createElement('div');
  el.className = 'ring'; el.style.left = x + 'px'; el.style.top = y + 'px';
  fxEl.appendChild(el); setTimeout(() => el.remove(), 600);
}
function bubble(x, y, text) {
  const el = document.createElement('div');
  el.className = 'bubble'; el.textContent = text;
  el.style.left = x + 'px'; el.style.top = Math.max(110, y) + 'px';
  fxEl.appendChild(el); setTimeout(() => el.remove(), 1700);
}
function sparkles(x, y, chars = ['✨', '⭐', '💖'], n = 7) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'spark'; el.textContent = rnd(chars);
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 90;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.style.setProperty('--dx', Math.cos(a) * d + 'px'); el.style.setProperty('--dy', Math.sin(a) * d - 40 + 'px');
    fxEl.appendChild(el); setTimeout(() => el.remove(), 1100);
  }
}
const hearts = (x, y) => sparkles(x, y, ['❤️', '💕', '💖'], 5);
const poof = (x, y) => sparkles(x, y, ['💨', '✨'], 5);
function propCenter(prop) {
  const b = prop.getBoundingClientRect();
  const a = toStage(b.left + b.width / 2, b.top), z = toStage(b.left, b.bottom);
  return { x: a.x, top: a.y, bottom: z.y, left: z.x, w: b.width / scale, h: b.height / scale };
}
function anim(el, cls) { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }

function propTap(prop, p) {
  const name = prop.dataset.prop;
  const c = propCenter(prop);
  switch (name) {
    case 'lamp': prop.classList.toggle('on'); snd('click'); break;
    case 'tv': prop.classList.toggle('on'); snd(prop.classList.contains('on') ? 'ok' : 'click'); break;
    case 'window': state.night = !state.night; stage.classList.toggle('night', state.night); $('#shade').classList.toggle('on', state.night); snd('whoosh'); save(); break;
    case 'sun': { const r = prop.querySelector('.rays'); r.classList.add('fast'); setTimeout(() => r.classList.remove('fast'), 1300); anim(prop, 'boing'); snd('ok'); break; }
    case 'tree': anim(prop, 'shake'); spawnItem('🍎', c.left + c.w * (0.2 + Math.random() * 0.6), c.top + c.h * 0.3); snd('boing'); break;
    case 'fridge': anim(prop, 'boing'); spawnItem(rnd(SPAWN.fridge), c.x + (Math.random() - 0.5) * 120, c.top + c.h * 0.5); snd('pop'); break;
    case 'stove': anim(prop, 'boing'); spawnItem(rnd(SPAWN.stove), c.x + (Math.random() - 0.5) * 140, c.top - 40); sparkles(c.x, c.top, ['💨', '♨️'], 4); snd('ok'); break;
    case 'icecream': anim(prop, 'boing'); spawnItem(rnd(SPAWN.icecream), c.x + (Math.random() - 0.5) * 160, c.top + 60); snd('ok'); break;
    case 'toybox': anim(prop, 'boing'); spawnItem(rnd(SPAWN.toybox), c.x + (Math.random() - 0.5) * 200, c.top - 220); sparkles(c.x, c.top, ['⭐', '✨']); snd('ok'); break;
    case 'wardrobe': anim(prop, 'boing'); openWardrobe(); break;
    case 'mirror': { anim(prop, 'boing'); const s = charById(state.sel); openCreator(s ? s.id : null); break; }
    case 'tub': sparkles(c.x, c.top, ['🫧', '🫧', '✨'], 9); snd('splash'); break;
    case 'toilet': anim(prop, 'spin'); sparkles(c.x, c.top + 80, ['💧', '🌀'], 5); snd('flush'); break;
    case 'trash': anim(prop, 'boing'); snd('tap'); break;
    case 'swing': {
      anim(prop.querySelector('.seat'), 'swinging');
      const seat = SEATS.find(s => s.kind === 'swing' && Math.abs(s.x - c.x) < 200);
      const rider = seat && state.chars.find(ch => ch.seat === seat.id);
      if (rider && rt[rider.id]) anim(rt[rider.id].pose, 'swinging');
      snd('whoosh'); break;
    }
    case 'barn': { anim(prop, 'boing'); const e = rnd(SPAWN.barn); spawnItem(e, c.x + (Math.random() - 0.5) * 140, c.bottom - 120); snd(PETS[e] || 'pop'); break; }
    case 'hen': anim(prop, 'boing'); spawnItem(rnd(SPAWN.hen), c.x + 40, c.top + 40); snd('cluck'); break;
    case 'floaty': case 'mailbox': case 'cafe': case 'books': case 'medkit': anim(prop, 'boing'); spawnItem(rnd(SPAWN[name]), c.x + (Math.random() - 0.5) * 160, c.top - 30); snd('ok'); break;
    case 'chest': anim(prop, 'boing'); spawnItem(rnd(SPAWN.chest), c.x + (Math.random() - 0.5) * 200, c.top - 200); sparkles(c.x, c.top, ['✨', '💎', '⭐']); snd('ok'); break;
    case 'car': case 'tractor': anim(prop, 'drive'); snd('honk'); break;
    case 'rack': case 'booth': anim(prop, 'shake'); openWardrobe(); break;
    case 'board': { const t = prop.querySelector('.chalk'); const m = ['א ב ג', '1 + 1 = 2', '🌞 🌈 ☁️', 'שלום!', '♡ ♡ ♡', '2 + 3 = 5']; t.textContent = m[(m.indexOf(t.textContent) + 1) % m.length]; snd('click'); break; }
    case 'globe': case 'chandelier': anim(prop, 'shake'); sparkles(c.x, c.top + 60, ['✨', '⭐']); snd('pop'); break;
    case 'tent': anim(prop, 'boing'); bubble(c.x, c.top, rnd(['🏕️', 'בוּ!', '🔦'])); snd('boing'); break;
    case 'fire': anim(prop, 'boing'); sparkles(c.x, c.top + 120, ['🔥', '✨'], 5); snd('whoosh'); break;
    case 'crab': anim(prop, 'scuttle'); bubble(c.x, c.top, '🦀'); snd('click'); break;
    case 'umbrella': case 'plant': case 'palm': anim(prop, 'shake'); snd('pop'); break;
    case 'flower': anim(prop, 'boing'); sparkles(c.x, c.top + 20, ['🌸', '✨', '🦋']); snd('pop'); break;
    case 'castle': anim(prop, 'boing'); sparkles(c.x, c.top, ['⭐', '✨']); snd('ok'); break;
    default: anim(prop, 'boing'); snd('boing');
  }
}

/* ---------------- map ---------------- */
$('#btnMap').addEventListener('click', () => {
  const grid = $('#mapGrid'); grid.innerHTML = '';
  for (const z of ZONES) {
    const n = state.chars.filter(c => { const g = geom(c); return g.px >= z.x0 && g.px < z.x0 + z.w; }).length;
    const b = document.createElement('button');
    b.className = 'place'; b.style.background = z.color;
    b.innerHTML = `${z.icon}<span>${z.name}</span>${n ? `<b class="who">👤 ${n}</b>` : ''}`;
    b.addEventListener('click', () => { $('#map').classList.add('hidden'); panTo(z.x0 + z.w / 2); snd('whoosh'); save(); });
    grid.appendChild(b);
  }
  $('#map').classList.remove('hidden'); snd('pop');
});
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => $('#' + b.dataset.close).classList.add('hidden')));
$('#map').addEventListener('click', (e) => { if (e.target.id === 'map') $('#map').classList.add('hidden'); });

/* ---------------- sound & fullscreen ---------------- */
function syncSoundBtn() { $('#btnSound').textContent = state.sound ? '🔊' : '🔇'; }
$('#btnSound').addEventListener('click', () => { state.sound = !state.sound; syncSoundBtn(); save(); snd('pop'); });
const standalone = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
if (standalone || !document.documentElement.requestFullscreen) $('#btnFull').classList.add('hidden');
$('#btnFull').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().then(() => { try { screen.orientation.lock('landscape'); } catch (e) { } }).catch(() => { });
});

/* ---------------- option panels (creator + wardrobe share this) ---------------- */
const TABS = [
  { icon: '✋', color: 'skin', colors: SKIN },
  { icon: '💇', style: 'hair', color: 'hairColor', colors: HAIRC, crop: '0 -18 120 130' },
  { icon: '👀', style: 'eyes', color: 'eyeColor', colors: EYEC, crop: '28 42 64 46' },
  { icon: '👄', style: 'mouth', crop: '38 70 44 36' },
  { icon: '✨', style: 'face', crop: '14 34 92 72' },
  { icon: '👕', style: 'top', color: 'topColor', colors: CLOTH, crop: '0 98 120 142' },
  { icon: '👖', style: 'bottom', color: 'bottomColor', colors: CLOTH, crop: '6 140 108 100' },
  { icon: '👟', style: 'shoe', color: 'shoes', colors: CLOTH, crop: '30 192 60 48' },
  { icon: '🎀', style: 'acc', color: 'accColor', colors: CLOTH, crop: '0 -18 120 130' },
];
const WARDROBE_TABS = ['top', 'bottom', 'shoe', 'acc', 'hair'].map(k => TABS.find(t => t.style === k));
$('#btnDress').addEventListener('click', () => { if ($('#wardrobe').classList.contains('hidden')) openWardrobe(); else $('#wardrobe').classList.add('hidden'); });

function buildPanel(tabsEl, panelEl, tabs, getLook, onPick, onDragPick) {
  let idx = 0;
  function render() {
    const look = getLook();
    tabsEl.innerHTML = '';
    tabs.forEach((t, i) => {
      const b = document.createElement('button');
      b.className = 'tab' + (i === idx ? ' on' : ''); b.textContent = t.icon;
      b.addEventListener('click', () => { idx = i; render(); snd('click'); });
      tabsEl.appendChild(b);
    });
    const t = tabs[idx], scroll = panelEl.scrollTop;
    panelEl.innerHTML = '';
    const mk = (cls, key, val) => {
      const b = document.createElement('button');
      b.className = cls + (look[key] === val ? ' on' : '');
      wireOpt(b, () => onPick(key, val), onDragPick ? (target) => onDragPick(target, key, val) : null);
      return b;
    };
    if (t.style) {
      const box = document.createElement('div'); box.className = 'opts';
      for (const o of OPTS[t.style]) {
        const b = mk('opt', t.style, o);
        if (o === 'none') { b.classList.add('none'); b.textContent = '🚫'; }
        else b.innerHTML = charSVG(Object.assign({}, look, { [t.style]: o }), { vb: t.crop });
        box.appendChild(b);
      }
      panelEl.appendChild(box);
    }
    if (t.color) {
      const box = document.createElement('div'); box.className = 'swatches';
      for (const col of t.colors) { const b = mk('sw', t.color, col); b.style.background = col; box.appendChild(b); }
      panelEl.appendChild(box);
    }
    panelEl.scrollTop = scroll;
  }
  return render;
}
// an option can be tapped, or (in the wardrobe) dragged onto a character
function wireOpt(btn, onTap, onDrop) {
  btn.addEventListener('pointerdown', (e) => {
    const sx = e.clientX, sy = e.clientY;
    let ghost = null;
    try { btn.setPointerCapture(e.pointerId); } catch (err) { }
    const move = (ev) => {
      if (!onDrop) return;
      if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 14) {
        ghost = btn.cloneNode(true); ghost.classList.add('ghost'); document.body.appendChild(ghost);
      }
      if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; }
    };
    const up = (ev) => {
      btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerup', up); btn.removeEventListener('pointercancel', up);
      if (ghost) {
        ghost.remove();
        const el = document.elementsFromPoint(ev.clientX, ev.clientY).map(x => x.closest && x.closest('.char')).find(Boolean);
        if (el) onDrop(charById(el.dataset.id));
      } else if (ev.type === 'pointerup') onTap();
    };
    btn.addEventListener('pointermove', move); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
  });
}

/* ---------------- wardrobe (in the bedroom) ---------------- */
function wardrobeTarget() { return charById(state.sel) || state.chars[0]; }
function applyLook(c, key, val) {
  if (!c) return;
  c.look = Object.assign({}, c.look, { [key]: val });
  drawChar(c);
  const g = geom(c);
  sparkles(g.px, g.py - g.ay * 0.6, ['✨', '💖', '⭐'], 6);
  bounce(rt[c.id].el, g.pose === 'stand' ? 'hop' : 'land');
  setExpr(c, 'happy', 1000);
  renderTray(); snd('pop'); save();
}
const renderWardrobe = buildPanel($('#wdTabs'), $('#wdPanel'), WARDROBE_TABS,
  () => Object.assign({}, DEFAULT_LOOK, (wardrobeTarget() || {}).look),
  (k, v) => { applyLook(wardrobeTarget(), k, v); renderWardrobe(); },
  (c, k, v) => { if (c) { select(c.id); applyLook(c, k, v); renderWardrobe(); } });
function openWardrobe() {
  if (!state.chars.length) return;
  // dress the selected character if it is on screen, otherwise the one nearest the middle of the screen
  const onScreen = (ch) => { const x = geom(ch).px; return x > camX && x < camX + viewW; };
  let c = charById(state.sel);
  if (!c || !onScreen(c)) {
    const mid = camX + viewW / 2;
    const near = state.chars.filter(onScreen).sort((a, b) => Math.abs(geom(a).px - mid) - Math.abs(geom(b).px - mid))[0];
    c = near || c || state.chars[0];
  }
  if (state.sel !== c.id) select(c.id);
  $('#wardrobe').classList.remove('hidden');
  const g = geom(c);
  camTarget = clamp(g.px - viewW * 0.28, 0, WORLD_W - viewW);   // keep the character visible beside the panel
  const want = camTarget + viewW * 0.28;
  if (g.pose === 'stand' && Math.abs(g.px - want) > 120) walkTo(c, want, c.y);   // at the world's edge: walk into view
  renderWardrobe(); snd('pop');
}
$('#wdClose').addEventListener('click', () => { $('#wardrobe').classList.add('hidden'); snd('click'); });

/* ---------------- creator ---------------- */
let edit = null;
const renderCreatorPanel = buildPanel($('#crTabs'), $('#crPanel'), TABS, () => edit.look, (k, v) => {
  edit.look[k] = v; renderCreator();
  bounce($('#crPreview')); snd('pop');
});
function renderCreator() { $('#crPreview').innerHTML = charSVG(edit.look); renderCreatorPanel(); }
$('#btnEdit').addEventListener('click', () => { const c = charById(state.sel); openCreator(c ? c.id : null); });
function openCreator(id) {
  const c = id ? charById(id) : null;
  edit = { id: c ? id : null, look: Object.assign({}, DEFAULT_LOOK, c ? c.look : randomLook()) };
  $('#crName').value = c ? c.name : rnd(NAMES);
  $('#crDelete').classList.toggle('hidden', !c);
  $('#crCancel').classList.toggle('hidden', !c && state.chars.length === 0);
  $('#creator').classList.remove('hidden');
  renderCreator(); snd('pop');
}
function closeCreator() { $('#creator').classList.add('hidden'); edit = null; }
$('#crRandom').addEventListener('click', () => { edit.look = randomLook(); renderCreator(); bounce($('#crPreview')); snd('boing'); });
$('#crCancel').addEventListener('click', () => { closeCreator(); snd('click'); });
$('#crSave').addEventListener('click', () => {
  const name = ($('#crName').value || '').trim() || rnd(NAMES);
  let c = edit.id && charById(edit.id);
  if (c) {
    c.look = edit.look; c.name = name;
    rt[c.id].el.querySelector('.name').textContent = name;
    drawChar(c);
  } else {
    c = { id: 'k' + Date.now(), name, look: edit.look, x: camX + viewW * (0.35 + Math.random() * 0.3), y: WALK_MIN + 80, seat: null };
    state.chars.push(c);
    const r = addCharEl(c);
    c.y = -60; place(c); r.fallTo = WALK_MIN + 60 + Math.random() * 100;
  }
  select(c.id);
  closeCreator(); snd('ok'); save();
});
$('#crDelete').addEventListener('click', () => {
  const c = charById(edit.id); if (!c) return;
  if (!confirm(`למחוק את ${c.name}?`)) return;
  state.items.filter(i => i.holder === c.id).forEach(i => dropFromHand(i, c));
  state.chars = state.chars.filter(x => x.id !== c.id);
  removeCharEl(c.id);
  if (state.sel === c.id) state.sel = state.chars[0] ? state.chars[0].id : null;
  renderTray(); closeCreator(); snd('whoosh'); save();
});

/* ---------------- boot ---------------- */
addEventListener('resize', layout);
addEventListener('orientationchange', () => setTimeout(layout, 200));
buildWorld();
$('#shade').classList.toggle('on', !!state.night);
layout();
renderTray();
syncSoundBtn();
requestAnimationFrame(tick);
if (!state.chars.length) openCreator(null);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
