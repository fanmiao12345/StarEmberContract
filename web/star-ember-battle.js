/* ============================================================================
   星烬契约 · 动态编阵战斗层  star-ember-battle.js  (v2.2.5)
   ----------------------------------------------------------------------------
   由 battle-preview.html 原型提炼为可复用模块，供主游戏 app.js 调用。
   职责：
     ① 动态编阵引擎 rowsOf / computeLayout / 卡牌 markup
     ② 人物形象卡（SVG 半身像占位，可换成 <img> 真实立绘）
     ③ 事件驱动打斗特效（普攻/暴击/术式/治疗/护盾/连携/击倒/胜利）
     ④ 粒子层（单 Canvas、按需 rAF、高低档、prefers-reduced-motion）
   设计约束：只操作传入的容器与 unit 元素；不改动任何战斗规则数值。
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.StarEmberBattle = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  /* ---------- 常量（与原型一一对应，改这里即可整体调速） ---------- */
  const FX = {
    LUNGE_MS: 460, FLASH_MS: 320, SLASH_MS: 340, SLASH_SIZE: 80,
    CRIT_MS: 320, SHAKE_MS: 320, SKILL_MS: 340, HEAL_MS: 300,
    SHIELD_RIPPLE_MS: 340, SHIELD_SHATTER_MS: 420, BOLT_MS: 320,
    DOWN_MS: 450, VICTORY_MS: 1700, DPR_CAP: 2, MAX_PARTS: 320, MIN_ART: 44
  };
  const hasDOM = typeof document !== 'undefined';
  // 无头测试环境（tests/*.test.js 在 Node 里跑 jsdom 桩）下不做动画
  const canAnimate = hasDOM && (typeof window === 'undefined' || !!window.requestAnimationFrame);
  const lowMotion = hasDOM && typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  /* ---------- 通用工具 ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = (n) => Number(n || 0).toLocaleString('en-US');
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const $ = (s, r) => (r || (hasDOM ? document : null) || {}).querySelector?.(s) || null;

  /* ==========================================================================
     ① 行数规则 rowsOf(n)：n≤4 单行；5~6 两行前排 ceil(n/2)；n≥7 两行前排 ceil(2n/3)
     ========================================================================== */
  function rowsOf(n) {
    n = Math.max(0, Math.round(num(n, 0)));
    if (n <= 4) return [Math.max(1, n)];
    if (n <= 6) { const f = Math.ceil(n / 2); return [f, n - f]; }
    const f = Math.ceil(2 * n / 3); return [f, n - f];
  }
  const totalRowsOf = (n, m) => rowsOf(n).length + rowsOf(m).length;

  /* ==========================================================================
     ② 卡牌尺寸自适应（舞台宽高实测 → CSS 变量）
     ========================================================================== */
  function computeLayout(stageW, stageH, nAlly, nEnemy) {
    const rowsA = rowsOf(nAlly), rowsE = rowsOf(nEnemy);
    const totalRows = rowsA.length + rowsE.length;
    const perRow = Math.max(1, ...rowsA, ...rowsE);
    let cw = Math.min(106, (stageW - 30 - 10 * (perRow - 1)) / perRow);
    let artH = 96;
    const avail = (stageH - 24) / totalRows - 34;
    if (avail < artH + 46) { artH = clamp(avail - 46, 56, artH); cw = Math.min(cw, artH * (106 / 96)); }
    cw = Math.max(34, cw);
    if (!Number.isFinite(cw) || cw <= 0) cw = 106;
    if (!Number.isFinite(artH) || artH <= 0) artH = 96;
    return { artH: Math.round(artH), cw: Math.round(cw), stack: totalRows >= 4, totalRows, rowsA, rowsE, perRow };
  }
  function applyLayout(stage, L) {
    if (!stage || !stage.style) return;
    stage.style.setProperty('--artH', L.artH + 'px');
    stage.style.setProperty('--cw', L.cw + 'px');
    stage.style.setProperty('--cwq', L.cw);
    stage.style.setProperty('--rowgap', L.stack ? '2px' : '6px');
    if (stage.classList) stage.classList.toggle('stack', L.stack);
  }

  /* ==========================================================================
     ③ 立绘：代码绘制 SVG 半身像（每角色独立配色 + 职业化饰件）
     接真实立绘：把 .art-slot 内的 <svg> 换成 <img src="…">，特效层不受影响
     ========================================================================== */
  const DEFAULT_PAL = ['#f6d365', '#6a5acd', '#101426'];
  const CLASS_OF_ROLE = { 强攻: 'assault', 刺击: 'assault', 术式: 'arcane', 控制: 'control', 防御: 'guard', 辅助: 'support', 治疗: 'support' };

  function heroArt(h, uid) {
    const pal = (h && h.pal) || DEFAULT_PAL;
    const [c1, c2, deep] = [pal[0] || DEFAULT_PAL[0], pal[1] || DEFAULT_PAL[1], pal[2] || DEFAULT_PAL[2]];
    const kind = (h && h.cls) || CLASS_OF_ROLE[(h && h.role) || ''] || 'assault';
    const K = 'se' + String(uid || Math.random().toString(36).slice(2, 8)).replace(/[^a-zA-Z0-9]/g, '');
    const skin = '#f0d3c0', skinShade = '#d8b3a2';
    const longHair = /长|辫|卷/.test((h && h.hair) || '');
    const weapon = {
      assault: `<g filter="url(#gw-${K})"><path d="M70 26 L83 52 L76 54 L65 30 Z" fill="${c1}"/><rect x="62" y="50" width="7" height="16" rx="3" fill="${c2}"/></g>`,
      arcane: `<g filter="url(#gw-${K})"><circle cx="85" cy="40" r="14" fill="none" stroke="${c1}" stroke-width="2.4" opacity=".85"/><ellipse cx="85" cy="40" rx="19" ry="6" fill="none" stroke="${c2}" stroke-width="1.6" opacity=".7"/><circle cx="85" cy="40" r="4.5" fill="${c1}"/></g>`,
      guard: `<g filter="url(#gw-${K})"><path d="M78 46 q15 -7 21 4 q5 12 -9 21 q-12 -4 -14 -12 Z" fill="${c2}" stroke="${c1}" stroke-width="1.6"/></g>`,
      support: `<g filter="url(#gw-${K})"><rect x="86" y="20" width="3" height="72" rx="1.5" fill="${c2}"/><circle cx="87.5" cy="18" r="7" fill="${c1}" opacity=".9"/><circle cx="87.5" cy="18" r="13" fill="${c1}" opacity=".18"/></g>`,
      control: `<g filter="url(#gw-${K})"><circle cx="18" cy="54" r="9" fill="none" stroke="${c1}" stroke-width="2.2"/><circle cx="18" cy="54" r="3" fill="${c1}"/><path d="M18 44 q9 -6 13 3" stroke="${c2}" stroke-width="1.5" fill="none" opacity=".8"/></g>`
    }[kind] || '';
    const face = `<g filter="url(#gs-${K})">
        <path d="M36 34 q14 -13 28 0 q2 14 -4 22 q-10 8 -20 0 q-6 -8 -4 -22 Z" fill="${skin}"/>
        <path d="M36 34 q14 -13 28 0 q1 8 -2 12 q-12 -7 -24 0 q-3 -4 -2 -12 Z" fill="${c1}" opacity=".92"/>
      </g>
      <g fill="${skinShade}" opacity=".5"><circle cx="44" cy="47" r="1.6"/><circle cx="56" cy="47" r="1.6"/></g>
      <g fill="${deep}" opacity=".55"><rect x="46" y="53" width="9" height="1.6" rx=".8"/></g>`;
    const hairBack = longHair
      ? `<path d="M30 32 q4 -26 20 -26 q18 0 22 26 q3 26 -3 44 h-12 q6 -24 2 -38 q-14 8 -24 0 q-4 14 2 38 h-12 q-6 -20 5 -44 Z" fill="${c2}" opacity=".95"/>`
      : `<path d="M30 36 q2 -22 20 -22 q18 0 20 22 q-12 -8 -20 -6 q-10 -2 -20 6 Z" fill="${c2}" opacity=".95"/>`;
    return `<svg viewBox="0 0 100 104" preserveAspectRatio="xMidYMin slice" role="img" aria-label="${(h && h.name) || ''}">
  <defs>
    <linearGradient id="gb-${K}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}" stop-opacity=".42"/><stop offset=".55" stop-color="${deep}" stop-opacity=".85"/><stop offset="1" stop-color="#05070f"/></linearGradient>
    <linearGradient id="gc-${K}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity=".34"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <radialGradient id="gh-${K}" cx="50%" cy="30%" r="52%"><stop offset="0" stop-color="${c1}" stop-opacity=".5"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
    <filter id="gs-${K}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.1"/></filter>
    <filter id="gw-${K}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>
  <rect width="100" height="104" fill="url(#gb-${K})"/>
  <circle cx="50" cy="38" r="44" fill="url(#gh-${K})"/>
  ${hairBack}
  <path d="M14 104 q0 -44 36 -56 q36 12 36 56 Z" fill="url(#gc-${K})"/>
  <path d="M50 58 l-9 46 h7 l6 -34 l6 34 h7 l-9 -46 Z" fill="${c1}" opacity=".45"/>
  <path d="M20 104 q4 -34 30 -44 q26 10 30 44 Z" fill="${deep}"/>
  <rect x="43" y="72" width="14" height="9" rx="4" fill="${c1}" opacity=".85"/>
  ${face}
  ${weapon}
  <g fill="${c1}" opacity=".55"><circle cx="20" cy="78" r="1.5"/><circle cx="80" cy="66" r="1.2"/><circle cx="86" cy="92" r="1.7"/><circle cx="14" cy="96" r="1.1"/><circle cx="70" cy="100" r="1.3"/></g>
</svg>`;
  }
  function enemyArt(e, uid) {
    const pal = (e && e.pal) || ['#ff8f6b', '#7c2d12', '#1b0f14'];
    const [c1, c2, deep] = pal;
    const K = 'se' + String(uid || Math.random().toString(36).slice(2, 8)).replace(/[^a-zA-Z0-9]/g, '');
    const spikes = [0, 1, 2, 3, 4].map((i) => `<path d="M${18 + i * 16} ${58 - (i % 2) * 8} l7 -22 l7 22 Z" fill="${c2}" opacity=".9"/>`).join('');
    const teeth = [0, 1, 2, 3].map((i) => `<rect x="${30 + i * 13}" y="110" width="4" height="9" rx="1.4"/>`).join('');
    return `<svg viewBox="0 0 100 104" preserveAspectRatio="xMidYMin slice" role="img" aria-label="${(e && e.name) || ''}">
  <defs>
    <linearGradient id="eb-${K}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1218"/><stop offset="1" stop-color="#07070d"/></linearGradient>
    <radialGradient id="eg-${K}" cx="50%" cy="46%" r="50%"><stop offset="0" stop-color="${c1}" stop-opacity=".75"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
    <filter id="ew-${K}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <rect width="100" height="104" fill="url(#eb-${K})"/>
  <circle cx="50" cy="46" r="38" fill="url(#eg-${K})"/>
  ${spikes}
  <g filter="url(#ew-${K})"><ellipse cx="50" cy="86" rx="30" ry="32" fill="${deep}"/></g>
  <g fill="${c1}"><ellipse cx="39" cy="82" rx="6.4" ry="4.2"/><ellipse cx="61" cy="82" rx="6.4" ry="4.2"/></g>
  <g fill="#0a0508"><ellipse cx="39" cy="82" rx="2.1" ry="3.4"/><ellipse cx="61" cy="82" rx="2.1" ry="3.4"/></g>
  <path d="M34 104 q16 12 32 0 q-6 16 -16 16 q-10 0 -16 -16 Z" fill="${deep}"/>
  <g fill="${c1}" opacity=".7">${teeth}</g>
  <path d="M12 104 q8 -36 38 -46 q30 10 38 46 Z" fill="${deep}"/>
  <path d="M22 104 q12 -30 28 -38 q16 8 28 38 Z" fill="${c2}" opacity=".55"/>
</svg>`;
  }

  /* ==========================================================================
     ④ 卡牌 markup
     ========================================================================== */
  const RARITY_CLS = { SSR: 'rar-SSR', SR: 'rar-SR', R: 'rar-R', ELITE: 'rar-ELITE', GRUNT: 'rar-GRUNT' };
  function unitHTML(u, rowIdx, slotIdx) {
    const rarity = (u.isEnemy && !RARITY_CLS[u.rarity]) ? 'GRUNT' : (u.rarity || 'R');
    const posTag = rowIdx === 0 ? '前' : '后';
    const sub = u.isEnemy ? (rarity === 'ELITE' ? '精英 · 魔物' : '魔物 · 游荡') : `${rarity} · ${u.role || ''}`;
    const hpPct = clamp(num(u.hp) / Math.max(1, num(u.maxHp, 1)), 0, 1);
    const shield = num(u.shield) > 0;
    return `<article class="unit ${RARITY_CLS[rarity] || 'rar-R'} ${u.downed ? 'downed' : ''} ${shield ? 'has-shield' : ''}"
      data-uid="${u.uid}" data-side="${u.side}" data-row="${rowIdx}" style="z-index:${rowIdx === 0 ? 3 : 2}">
    <div class="u-pos"><b>${posTag}</b>${slotIdx + 1}</div>
    <div class="u-art"><div class="art-slot">${u.isEnemy ? enemyArt(u, u.uid) : heroArt(u, u.uid)}</div></div>
    <div class="u-plate">
      <b>${u.name}</b><small>${sub}</small>
      <div class="u-hp${hpPct <= 0.3 ? ' low' : ''}"><i style="transform:scaleX(${hpPct.toFixed(4)})"></i></div>
    </div>
    <div class="u-shield"></div>
    <div class="u-out"><span class="u-num">${fmt(Math.max(0, Math.round(num(u.hp))))}</span><span class="u-st">${shield ? '◈ 护盾 ' + Math.round(num(u.shield)) : (u.downed ? '已击倒' : '')}</span></div>
  </article>`;
}
  /* 布局：把单位按行分块；敌方后排在上、我方前排在上（深度关系） */
  function chunkRows(units, rows) {
    const out = []; let k = 0;
    rows.forEach((n) => { out.push(units.slice(k, k + n)); k += n; });
    return out;
  }
  /**
   * 铺阵：估算初值 → 写 CSS 变量 → 生成卡牌 → 实测收缩（最多 6 轮）
   * 实测收缩是"任何人数组合都不溢出"的保证，估算式只负责给初值。
   */
  function renderFormation(host, cfg) {
    if (!host) return null;
    const allies = cfg.allies || [], enemies = cfg.enemies || [];
    const stage = cfg.stage || host;
    const rowsA = rowsOf(allies.length), rowsE = rowsOf(enemies.length);
    const totalRows = rowsA.length + rowsE.length;
    const perRow = Math.max(1, ...rowsA, ...rowsE);
    const stageW = cfg.stageW || host.clientWidth || 358;

    const paint = (L) => {
      applyLayout(stage, L);
      [['enemy', enemies], ['ally', allies]].forEach(([side, units]) => {
        const rows = chunkRows(units, rowsOf(units.length));
        const order = side === 'enemy' ? rows.map((_, i) => rows.length - 1 - i) : rows.map((_, i) => i);
        // 本阵型用不到的行必须清空，否则上一阵型的卡会残留叠在舞台里
        host.querySelectorAll(`.row[data-side="${side}"]`).forEach((rowEl) => { rowEl.innerHTML = ''; });
        order.forEach((rowIdx) => {
          const rowEl = host.querySelector(`.row[data-side="${side}"][data-row="${rowIdx}"]`);
          if (!rowEl) return;
          rowEl.innerHTML = (rows[rowIdx] || []).map((u, i) => unitHTML(Object.assign({ side }, u), rowIdx, i)).join('');
        });
      });
    };
    const measuredAt = (L) => {
      const a = host.querySelector('#side-ally'), e = host.querySelector('#side-enemy');
      const need = ((e && e.offsetHeight) || 0) + ((a && a.offsetHeight) || 0);
      const gaps = Math.max(0, totalRows - 2) * (L.stack ? 2 : 6);
      const labels = L.stack ? 16 : 36;
      return { need, have: (host.clientHeight || 600) * 0.985 - gaps - labels };
    };

    let L = computeLayout(stageW, cfg.stageH || host.clientHeight || 600, allies.length, enemies.length);
    for (let i = 0; i < 6; i++) {
      paint(L);
      if (!hasDOM || !host.clientHeight) break;
      const m = measuredAt(L);
      if (m.need <= m.have) break;
      const k = clamp(m.have / Math.max(1, m.need), 0.74, 0.98);
      const nextArt = Math.max(FX.MIN_ART, Math.floor(L.artH * k));
      const nextCw = Math.max(30, Math.floor(L.cw * k));
      if (nextArt === L.artH && nextCw === L.cw) break;
      L = Object.assign({}, L, { artH: nextArt, cw: nextCw });
    }
    paint(L);
    return { layout: L, units: [...host.querySelectorAll('.unit')].map((el) => el.dataset.uid) };
  }

  /* ==========================================================================
     ⑤ 粒子层（单 Canvas + 按需 rAF）
     ========================================================================== */
  function createParticles(stage, canvas, isHigh) {
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    let parts = [], rafId = 0, dpr = 1, cw = 0, ch = 0, lastT = 0;
    function size() {
      if (!canvas || !stage) return;
      dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, FX.DPR_CAP);
      cw = stage.clientWidth || 358; ch = stage.clientHeight || 600;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function point(uid) {
      const el = stage && stage.querySelector(`.unit[data-uid="${uid}"]`);
      if (!el || !stage.getBoundingClientRect) return { x: cw / 2, y: ch / 2 };
      const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
    }
    function spawn(uid, kind, n, opt) {
      opt = opt || {};
      if (!ctx || !isHigh() || lowMotion) return;
      const p = point(uid), tint = opt.tint || '#ffe08a';
      for (let i = 0; i < n; i++) {
        if (parts.length >= FX.MAX_PARTS) break;
        const a = opt.angle != null ? opt.angle + (Math.random() - .5) * (opt.spread || 1.6) : Math.random() * Math.PI * 2;
        const sp = opt.speed || (60 + Math.random() * 110);
        parts.push({ kind, x: p.x + (Math.random() - .5) * 14, y: p.y + (Math.random() - .5) * 14,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: opt.decay || (1.5 + Math.random()),
          tint, rot: a, len: opt.len || (18 + Math.random() * 20), grav: opt.grav || 0 });
      }
      kick();
    }
    function step(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const q = parts[i]; q.life -= q.decay * dt;
        if (q.life <= 0) { parts.splice(i, 1); continue; }
        q.vy += (q.grav || 0) * dt * 420; q.x += q.vx * dt; q.y += q.vy * dt;
        q.vx *= (1 - 1.6 * dt); q.vy *= (1 - 1.2 * dt);
      }
    }
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, cw, ch);
      for (const q of parts) {
        ctx.globalAlpha = clamp(q.life, 0, 1);
        if (q.kind === 'spark') {
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
          const g = ctx.createLinearGradient(0, 0, 0, -q.len);
          g.addColorStop(0, q.tint); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 2.1; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -q.len); ctx.stroke(); ctx.restore();
        } else if (q.kind === 'dust') { ctx.fillStyle = '#aeb6c6'; ctx.fillRect(q.x - 2, q.y - 2, 4, 4); }
        else { ctx.fillStyle = q.tint; ctx.beginPath(); ctx.arc(q.x, q.y, q.kind === 'mote' ? 2.6 : 2.2, 0, 6.284); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) {
      const dt = Math.min(.05, (t - lastT) / 1000 || .016); lastT = t;
      step(dt); draw();
      if (parts.length) rafId = requestAnimationFrame(loop);
      else { rafId = 0; if (ctx) ctx.clearRect(0, 0, cw, ch); }   // 无粒子 → 循环彻底停止
    }
    function kick() {
      if (!canAnimate || rafId || !parts.length) return;
      lastT = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      rafId = requestAnimationFrame(loop);
    }
    function clear() { parts = []; if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } if (ctx) ctx.clearRect(0, 0, cw, ch); }
    return { size, point, spawn, clear, count: () => parts.length, running: () => !!rafId };
  }

  /* ==========================================================================
     ⑥ 战斗层实例：每种战斗表面创建一个，管理 DOM 特效 + 卡牌同步
     ========================================================================== */
  function createLayer(opts) {
    opts = opts || {};
    const stage = opts.stage, fxLayer = opts.fxLayer, shakeHost = opts.shakeHost || opts.stage;
    const state = { fxHigh: opts.fxHigh !== false, units: new Map(), over: false };
    if (lowMotion) state.fxHigh = false;
    const parts = hasDOM && opts.canvas ? createParticles(stage, opts.canvas, () => state.fxHigh) : null;
    if (parts) parts.size();

    const elOf = (uid) => (stage && stage.querySelector ? stage.querySelector(`.unit[data-uid="${uid}"]`) : null);
    const unitOf = (uid) => state.units.get(uid) || null;
    const aliveIn = (side) => [...state.units.values()].filter((u) => u.side === side && !u.downed);

    function addFx(html, ms) {
      if (!hasDOM || !fxLayer) return null;
      const w = document.createElement('div');
      w.innerHTML = String(html).trim();
      const el = w.firstElementChild;
      if (!el) return null;
      fxLayer.appendChild(el);
      setTimeout(() => { try { el.remove(); } catch (e) { } }, ms);
      return el;
    }
    function pointOf(uid) {
      if (parts) return parts.point(uid);
      const el = elOf(uid);
      if (!el || !stage.getBoundingClientRect) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
    }
    const stageH = () => (stage && stage.clientHeight) || 600;

    function numFx(uid, text, kind, drift) {
      const p = pointOf(uid);
      const dir = drift != null ? drift : (p.y < stageH() * 0.52 ? 1 : -1);   // 上方单位数字向下飘
      const cls = ['fx-num', kind === 'crit' ? 'crit' : kind === 'heal' ? 'heal' : kind === 'skill' ? 'skill' : kind === 'absorb' ? 'absorb' : ''].join(' ').trim();
      return addFx(`<span class="fx ${cls} ${dir > 0 ? 'down' : ''}" style="left:${p.x}px;top:${p.y}px">${text}</span>`, 1200);
    }
    function ringFx(uid, color, size) {
      const p = pointOf(uid);
      return addFx(`<span class="fx fx-ring" style="left:${p.x}px;top:${p.y}px;--s:${size || 76}px;--c:${color}"></span>`, 700);
    }
    function burstFx(uid, color, size) {
      const p = pointOf(uid);
      return addFx(`<span class="fx fx-burst" style="left:${p.x}px;top:${p.y}px;--s:${size || 90}px;--c:${color}"></span>`, 640);
    }
    function slashFx(uid, color) {
      const p = pointOf(uid);
      return addFx(`<span class="fx fx-slash" style="left:${p.x}px;top:${p.y}px;--c:${color}">
        <svg viewBox="0 0 100 100"><path d="M8 74 A52 52 0 0 1 92 26"/></svg></span>`, FX.SLASH_MS + 120);
    }
    function boltFx(aUid, bUid) {
      const a = pointOf(aUid), b = pointOf(bUid);
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      const segs = 7, pts = [];
      for (let i = 1; i <= segs; i++) {
        const t = i / segs, jx = i === segs ? 0 : (Math.random() - .5) * len * 0.16, jy = i === segs ? 0 : (Math.random() - .5) * len * 0.16;
        pts.push([dx * t + jx, dy * t + jy]);
      }
      const d = 'M0 0 ' + pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
      const vx = Math.min(0, dx) - 2, vy = Math.min(0, dy) - 2, vw = Math.abs(dx) + 4, vh = Math.abs(dy) + 4;
      return addFx(`<span class="fx fx-bolt" style="left:${a.x}px;top:${a.y}px;--w:${Math.abs(dx) + 2}px;--h:${Math.abs(dy) + 2}px;--len:${Math.round(len * 1.5)}">
        <svg viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="none"><path d="${d}"/></svg></span>`, FX.BOLT_MS + 120);
    }
    function flashUnit(uid) {
      const el = elOf(uid); if (!el || !el.classList || !canAnimate) return;
      el.classList.remove('hit-flash'); void el.offsetWidth; el.classList.add('hit-flash');
      setTimeout(() => el.classList.remove('hit-flash'), FX.FLASH_MS);
    }
    function shake(ms) {
      if (!state.fxHigh || lowMotion || !shakeHost || !shakeHost.classList || !canAnimate) return;
      shakeHost.classList.remove('shake'); void shakeHost.offsetWidth; shakeHost.classList.add('shake');
      setTimeout(() => shakeHost.classList.remove('shake'), ms || FX.SHAKE_MS);
    }
    function syncUnit(uid) {
      const u = unitOf(uid), el = elOf(uid);
      if (!u || !el) return;
      const pct = clamp(num(u.hp) / Math.max(1, num(u.maxHp, 1)), 0, 1);
      u.hpPct = pct;
      const bar = el.querySelector('.u-hp'), fill = el.querySelector('.u-hp i');
      if (fill) fill.style.transform = `scaleX(${pct.toFixed(4)})`;
      if (bar && bar.classList) bar.classList.toggle('low', pct <= 0.3);
      const numEl = el.querySelector('.u-num'); if (numEl) numEl.textContent = fmt(Math.max(0, Math.round(num(u.hp))));
      const stEl = el.querySelector('.u-st');
      if (stEl) stEl.textContent = num(u.shield) > 0 ? `◈ 护盾 ${Math.round(num(u.shield))}` : (u.downed ? '已击倒' : '');
      if (el.classList) {
        el.classList.toggle('has-shield', num(u.shield) > 0);
        el.classList.toggle('downed', !!u.downed);
      }
    }
    const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

    async function lungeTo(aUid, tUid, ms) {
      const a = elOf(aUid), t = elOf(tUid);
      if (!a || !t || !canAnimate) return;
      ms = ms || FX.LUNGE_MS;
      const ar = a.getBoundingClientRect(), tr = t.getBoundingClientRect();
      const dx = (tr.left + tr.width / 2 - (ar.left + ar.width / 2)) * 0.55;
      const dy = (tr.top + tr.height / 2 - (ar.top + ar.height / 2)) * 0.55;
      a.classList.add('lunge'); a.classList.remove('lunge-back');
      a.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`;
      await sleep(ms * 0.28);
      a.classList.remove('lunge'); a.classList.add('lunge-back');
      a.style.transform = 'translate3d(0,0,0)';
      await sleep(ms * 0.72);
      a.classList.remove('lunge-back'); a.style.transform = '';
    }
    function recoil(uid, dir) {
      const el = elOf(uid); if (!el || !state.fxHigh || lowMotion || !canAnimate) return;
      el.classList.add('recoil'); el.style.transform = `translate3d(${(dir || 1) * 5}px,2px,0)`;
      setTimeout(() => {
        el.classList.remove('recoil'); el.classList.add('recoil-back'); el.style.transform = 'translate3d(0,0,0)';
        setTimeout(() => { el.classList.remove('recoil-back'); el.style.transform = ''; }, 180);
      }, 100);
    }
    function knockDown(uid) {
      const u = unitOf(uid); if (!u) return;
      u.downed = true; u.hp = 0; u.shield = 0;
      const el = elOf(uid);
      if (el && el.classList) { el.classList.remove('has-shield'); el.classList.add('downed'); }
      const st = el && el.querySelector('.u-st'); if (st) st.textContent = '已击倒';
      if (parts) parts.spawn(uid, 'dust', 14, { tint: '#b9c0cf', speed: 110, grav: .6, decay: 1.6 });
    }

    /* ---------- 事件特效（供主引擎按帧调用） ---------- */
    async function fxBasic(aUid, tUid) {
      const a = unitOf(aUid), t = unitOf(tUid); if (!a || !t || a.downed || t.downed) return;
      await lungeTo(aUid, tUid);
      slashFx(tUid, a.tint || '#ffffff');
      if (parts) parts.spawn(tUid, 'spark', 10, { tint: a.tint, speed: 150, decay: 2.4 });
      flashUnit(tUid); recoil(tUid, t.isEnemy ? 1 : -1);
      await sleep(150);
    }
    async function fxCrit(aUid, tUid) {
      const a = unitOf(aUid), t = unitOf(tUid); if (!a || !t || a.downed || t.downed) return;
      await lungeTo(aUid, tUid, 400);
      slashFx(tUid, '#ffe08a'); ringFx(tUid, '#ffd257', 118); burstFx(tUid, '#ffd257', 120);
      if (parts) parts.spawn(tUid, 'spark', 26, { tint: '#ffe08a', speed: 260, decay: 2.1 });
      flashUnit(tUid); shake();
      await sleep(FX.CRIT_MS + 120);
    }
    async function fxSkill(aUid, tUids) {
      const a = unitOf(aUid); if (!a || a.downed) return;
      const list = (Array.isArray(tUids) ? tUids : [tUids]).filter((id) => { const u = unitOf(id); return u && !u.downed; });
      if (!list.length) return;
      burstFx(aUid, a.tint || '#c9a3ff', 72);
      await sleep(180);
      for (const id of list) {
        burstFx(id, '#c9a3ff', 104); ringFx(id, '#d9b6ff', 92);
        if (parts) parts.spawn(id, 'spark', 16, { tint: '#d9b6ff', speed: 190, decay: 2.2 });
        flashUnit(id);
        await sleep(120);
      }
      await sleep(Math.max(0, FX.SKILL_MS - 120));
    }
    async function fxHeal(tUid) {
      const t = unitOf(tUid); if (!t) return;
      ringFx(tUid, '#7ee8a2', 94);
      if (parts) parts.spawn(tUid, 'mote', 12, { tint: '#9df0b8', speed: 70, grav: 0, decay: 1.2, angle: -Math.PI / 2, spread: 1.4 });
      syncUnit(tUid);
      await sleep(FX.HEAL_MS);
    }
    async function fxShield(tUid) {
      const t = unitOf(tUid); if (!t) return;
      syncUnit(tUid);
      ringFx(tUid, '#8fd4ff', 100); burstFx(tUid, '#8fd4ff', 86);
      if (parts) parts.spawn(tUid, 'mote', 10, { tint: '#9fdcff', speed: 60, grav: 0, decay: 1.3, angle: -Math.PI / 2, spread: 1.6 });
      await sleep(FX.SHIELD_RIPPLE_MS);
    }
    function shieldRipple(uid) {
      const el = elOf(uid); const sh = el && el.querySelector('.u-shield'); if (!sh || !canAnimate) return;
      sh.classList.remove('ripple'); void sh.offsetWidth; sh.classList.add('ripple');
      setTimeout(() => sh.classList.remove('ripple'), FX.SHIELD_RIPPLE_MS + 60);
    }
    function shieldShatter(uid) {
      const el = elOf(uid); const sh = el && el.querySelector('.u-shield'); if (!sh || !canAnimate) return;
      sh.classList.remove('ripple'); sh.classList.add('shatter');
      burstFx(uid, '#8fd4ff', 86);
      if (parts) parts.spawn(uid, 'mote', 10, { tint: '#9fdcff', speed: 96, decay: 2 });
      setTimeout(() => sh.classList.remove('shatter'), FX.SHIELD_SHATTER_MS + 80);
    }
    async function fxCombo(aUid, bUid, tUid) {
      const a = unitOf(aUid), b = unitOf(bUid), t = unitOf(tUid);
      if (!a || !b || !t || t.downed) return;
      boltFx(aUid, bUid); await sleep(120);
      boltFx(bUid, aUid); await sleep(FX.BOLT_MS - 120);
      await lungeTo(bUid, tUid, 420);
      slashFx(tUid, '#ffe08a'); ringFx(tUid, '#ffd257', 126);
      if (parts) parts.spawn(tUid, 'spark', 24, { tint: '#ffe9a8', speed: 250, decay: 2.1 });
      flashUnit(tUid); shake();
      await sleep(FX.CRIT_MS + 140);
    }
    function victory() {
      state.over = true;
      if (parts) [...state.units.values()].filter((u) => u.isEnemy && !u.downed)
        .forEach((u) => parts.spawn(u.uid, 'mote', 6, { tint: '#ffe6a6', speed: 80, grav: 0, decay: 1.4, angle: -Math.PI / 2, spread: 1.8 }));
      return addFx(`<div class="fx-victory"><div><span>BATTLE CLEAR</span><b>战斗胜利</b></div></div>`, FX.VICTORY_MS + 200);
    }

    /* ---------- 帧驱动：用主引擎的时间线驱动卡牌与特效 ---------- */
    function setUnits(allies, enemies) {
      state.units = new Map();
      (allies || []).forEach((u) => state.units.set(u.uid, Object.assign({ side: 'ally', isEnemy: false }, u)));
      (enemies || []).forEach((u) => state.units.set(u.uid, Object.assign({ side: 'enemy', isEnemy: true }, u)));
      state.over = false;
    }
    function syncAll() { state.units.forEach((_, uid) => syncUnit(uid)); }
    /* 依据引擎给出的 effect/文本，选择对应特效播放 */
    async function playEffect(actorUid, targetUids, effect, text, side) {
      const eff = effect || {};
      const t0 = (targetUids || [])[0];
      const maybeCrit = eff.kind === 'critical' || /暴击/.test(text || '');
      if (eff.kind === 'heal') { for (const t of targetUids) await fxHeal(t); return 'heal'; }
      if (eff.kind === 'shield') { for (const t of targetUids) await fxShield(t); return 'shield'; }
      if (/连携|协奏/.test(text || '')) { if (targetUids.length && actorUid) await fxCombo(actorUid, targetUids[1] || actorUid, t0); return 'combo'; }
      if (maybeCrit) { await fxCrit(actorUid, t0); return 'crit'; }
      if (/施放|发动|术式|群体|终焉/.test(text || '') || (targetUids || []).length > 1) { await fxSkill(actorUid, targetUids); return 'skill'; }
      if (actorUid && t0) { await fxBasic(actorUid, t0); return 'basic'; }
      return 'none';
    }
    function dispose() {
      if (parts) parts.clear();
      if (fxLayer) fxLayer.innerHTML = '';
      state.units.clear();
      removeResize();
    }
    /* 尺寸变化时重算画布 */
    let resizeBound = null;
    function bindResize() {
      if (!hasDOM || typeof window === 'undefined' || resizeBound) return;
      resizeBound = () => { if (parts) { parts.size(); } };
      window.addEventListener('resize', resizeBound);
    }
    function removeResize() {
      if (!hasDOM || typeof window === 'undefined' || !resizeBound) return;
      window.removeEventListener('resize', resizeBound); resizeBound = null;
    }
    bindResize();

    return {
      state, FX, parts,
      elOf, unitOf, aliveIn, setUnits, syncUnit, syncAll, playEffect,
      fxBasic, fxCrit, fxSkill, fxHeal, fxShield, fxCombo, knockDown, victory,
      shieldRipple, shieldShatter, flashUnit, shake, numFx, ringFx, burstFx, slashFx, boltFx,
      resize: () => { if (parts) parts.size(); },
      dispose,
      get fxHigh() { return state.fxHigh; },
      set fxHigh(v) { state.fxHigh = !!v; if (!v && parts) parts.clear(); }
    };
  }

  /* ---------- 静态特效（无战斗层时单发用） ---------- */
  function staticLayer(opts) { return createLayer(opts); }

  return {
    version: '2.2.5',
    FX, rowsOf, totalRowsOf, computeLayout, applyLayout,
    heroArt, enemyArt, unitHTML, chunkRows, renderFormation,
    createLayer, createParticles, staticLayer,
    lowMotion, canAnimate,
    RARITY_CLS, CLASS_OF_ROLE
  };
});
