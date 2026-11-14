import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {SerifSubs} from './IkkiBog';
import {TimedWord} from './bog/anim';
import {loadFonts} from './Juma';
import {GOLD2, SoundBed} from './blocks/V2';
import {F, V3} from './yusuf/Desert3D';
import {ARMS, hand} from './yusuf/Human3D';
import {Actor, Desert2, W, World2, gy} from './yusuf/World2';
import durations from '../public/vo-67/durations.json';
import words from '../public/vo-67/words.json';

/**
 * Yusuf 2/5: Quduq (12:10-18). Полностью 3D по раскадровке reels/scripts/storyboard-67.md.
 * На экране из текста только субтитры. Лиц нет ни у кого. Падение мальчика в колодец не показано.
 * Источники: Qur'on 12:10-18 (uz.sodik), Ibn Kathir 12:18 (овца, рубаха не порвана).
 */
const FPS = 30, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5, 6];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const YUSUF2_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const k = (t: number, a: number, b: number) => { const c = lin(t, a, b); return c * c * (3 - 2 * c); };
const mv = (p: V3, q: V3, u: number): V3 => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u];
const add = (p: V3, q: V3): V3 => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const G = (x: number, z: number): V3 => [x, gy(x, z), z];
const face = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);
const BR = [0, 1, 3, 4, 6, 7, 8, 9, 10];
type Out = {w: World2; dark?: number};

const brother = (seed: number, p: V3, ry: number, o: Partial<Extract<Actor, {k: 'h'}>> = {}): Actor => ({k: 'h', p, ry, seed, ...o});
const father = (p: V3, ry: number, o: Partial<Extract<Actor, {k: 'h'}>> = {}): Actor => ({k: 'h', p, ry, seed: 5, beard: true, s: 1.04, ...o});
const boy = (p: V3, ry: number, o: Partial<Extract<Actor, {k: 'h'}>> = {}): Actor => ({k: 'h', p, ry, seed: 2, s: 0.62, ...o});
const walkers = (n: number, a: V3, b: V3, u: number, t: number, o: {spread?: number; seeds?: number[]; arms?: (i: number) => Partial<Extract<Actor, {k: 'h'}>>} = {}): Actor[] => {
  const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz), ry = Math.atan2(dx, dz), px = -dz / len, pz = dx / len, sp = o.spread ?? 0.9;
  return Array.from({length: n}, (_, i) => {
    const off = (i - (n - 1) / 2) * sp, lag = ((i * 7) % 5) * 0.35 - 0.7, x = a[0] + dx * u + px * off - (dx / len) * lag, z = a[2] + dz * u + pz * off - (dz / len) * lag;
    return {k: 'h', p: G(x, z), ry, seed: (o.seeds ?? BR)[i % BR.length], walk: t * 6.2 + i * 1.3, ...(o.arms ? o.arms(i) : {})} as Actor;
  });
};
const ringPos = (i: number, n = 9, r = 1.75): V3 => { const a = (i / n) * Math.PI * 2 + 0.3; return G(F[0] + Math.cos(a) * r, F[2] + Math.sin(a) * r); };
const ring = (t: number, stand = -1, standU = 0, o: Partial<Extract<Actor, {k: 'h'}>> = {}): Actor[] => BR.map((s, i) => { const p = ringPos(i); const ry = face(p, G(F[0], F[2])); return brother(s, p, ry, i === stand ? {sit: 1 - standU, ...o} : {sit: 1}); });
const T0: V3 = [0, 0, 0];
const FIRE = (red = 0.3, flare = 0, dim = 0): Actor => ({k: 'fire', red, flare, dim});

const shot = (n: number, t: number): Out => {
  switch (n) {
    case 1: {
      const tm0 = 0.05 + 0.25 * lin(t, 0, 19.6);
      if (t < 1.78) { const bp = G(9 - 1.7 * lin(t, 0, 1.78), 5.2), ry = -Math.PI / 2; return {w: {pos: [bp[0] + 0.3, 1.05, bp[2] + 1.5], look: [bp[0] - 0.1, 1.0, bp[2] + 0.2], fov: 36, time: tm0, tent: false, actors: [brother(3, bp, ry, {walk: t * 6.2, aR: [0.75, 0.15, 0.95]}), {k: 'shirt', p: hand(bp, ry, [0.3, 1.05, 0.28]), ry: 0.2, pose: 'held', stain: 1, t} as Actor, brother(1, G(bp[0] + 1.9, 4.4), ry, {walk: t * 6.2 + 1})]}}; }
      if (t < 5.03) { const u = lin(t, 1.78, 5.03), a: V3 = [13, 0, 6.2], b: V3 = [4.3, 0, 4.6], c = mv(a, b, u); return {w: {pos: [c[0] + 2.6, 1.55, c[2] + 2.8], look: [1.2, 1.2, 2.3], time: tm0, fov: 42, actors: [...walkers(5, a, b, u, t, {arms: (i) => (i === 2 ? {aR: [0.75, 0.15, 0.95]} : (i === 0 || i === 3) && t > 2.56 ? {aR: ARMS.face} : {})}), {k: 'shirt', p: add(G(c[0] - 0.5, c[2] - 0.5), [0.1, 1.05, 0.4]), pose: 'held', stain: 1, t} as Actor]}}; }
      if (t < 7.0) { const u = lin(t, 5.03, 7.0), p = G(3.4, 4.6), ry = face(p, [0.2, 0, 2.4]); return {w: {pos: mv([5.8, 1.5, 6.5], [5.0, 1.45, 5.8], u), look: [1.4, 1.2, 2.6], time: tm0, fov: 40, actors: [brother(3, p, ry, {aR: [1.2, 0.1, 0.35]}), {k: 'shirt', p: hand(p, ry, [0.2, 1.3, 0.7]), ry, pose: 'held', stain: 1, t} as Actor]}}; }
      if (t < 10.19) { const u = lin(t, 7.0, 10.19), hp = G(2.8, 3.7); return {w: {pos: mv([3.1, 1.4, 5.9], [2.9, 1.3, 5.1], u), look: [2.8, 1.28, 4.1], time: tm0, fov: 36, actors: [brother(3, hp, 0, {aL: [1.35, 0.25, 0.45], aR: [1.35, 0.25, 0.45]}), {k: 'shirt', p: [2.8, 1.3, 4.1], ry: 0.15, pose: 'held', stain: k(t, 7.0, 7.7), t} as Actor]}}; }
      if (t < 13.25) { const u = lin(t, 10.19, 13.25), bp = G(0.9, 4.5), fp = G(-0.3, 2.6); return {w: {pos: mv([1.9, 1.3, 6.5], [1.5, 1.25, 6.0], u), look: [-0.3, 1.0, 3.0], time: tm0, fov: 40, actors: [father(fp, 0.35, {sit: 1, aR: t > 11.3 ? ARMS.stop : ARMS.rest}), brother(3, bp, Math.PI, {aR: [1.2, 0.1, 0.35]}), {k: 'shirt', p: hand(bp, Math.PI, [-0.2, 1.3, 0.7]), ry: Math.PI, pose: 'held', stain: 1, t} as Actor]}}; }
      if (t < 16.32) { const u = t < 13.6 ? k(t, 13.25, 13.6) * 0.5 : 0.5 + 0.5 * lin(t, 13.6, 16.32); return {w: {pos: mv([1.3, 1.25, 6.0], [0.0, 1.0, 3.9], u), look: [-0.3, 1.0, 2.6], time: tm0, fov: 40, actors: [father(G(-0.3, 2.6), 0.35, {sit: 1, head: [0, 0.35], aR: ARMS.rest}), {k: 'shirt', p: [0.4, 0.03, 3.7], pose: 'ground', stain: 1, t} as Actor, {k: 'light', p: [3, 1.2, 4.2], color: '#ff4a22', i: 6, d: 8}]}}; }
      const u = lin(t, 16.32, 19.63);
      return {dark: k(t, 19.0, 19.63), w: {pos: mv([1.9, 2.3, 5.5], [1.0, 0.55, 4.2], u), look: [0.6, 0.05, 3.6], time: 0.3, fov: 40, actors: [{k: 'shirt', p: [0.6, 0.03, 3.6], ry: 0.4, pose: 'ground', stain: 1, t} as Actor, father(G(-0.6, 2.4), 0.35, {sit: 1})]}};
    }
    case 2: {
      const u = lin(t, 0, 9.24), a7 = (7 / 9) * Math.PI * 2 + 0.3, dOut: V3 = [Math.cos(a7), 0, Math.sin(a7)];
      const base = {time: 0.62, tent: true};
      if (t < 1.97) return {dark: 1 - k(t, 0, 0.4), w: {...base, pos: mv([F[0] - 9, 4.6, F[2] + 10], [F[0] - 8, 4.2, F[2] + 9], lin(t, 0, 1.97)), look: [F[0], 0.8, F[2]], fov: 40, actors: [FIRE(0.3), ...ring(t)]}};
      if (t < 3.45) { const su = k(t, 2.0, 3.0); return {w: {...base, pos: [F[0] + dOut[0] * 3.1, 0.8 + 0.7 * lin(t, 1.97, 3.45), F[2] + dOut[2] * 3.1], look: [F[0], 1.1, F[2]], fov: 42, actors: [FIRE(0.5), ...ring(t, 7, su)]}}; }
      if (t < 5.17) { const fl = 0.8 * Math.exp(-Math.max(0, t - 3.94) * 2.5) * (t >= 3.94 ? 1 : 0); return {w: {...base, pos: [F[0] + dOut[0] * 2.0 - dOut[2] * 0.4, 1.45, F[2] + dOut[2] * 2.0 + dOut[0] * 0.4], look: [F[0], 1.2, F[2]], fov: 38, actors: [FIRE(0.6, fl), ...ring(t, 7, 1, {aR: ARMS.stop})]}}; }
      if (t < 7.19) { const P = G(F[0] + 3.2, F[2] - 1.8), ry = face(P, G(W[0], W[2])); return {w: {...base, pos: mv([P[0] - 2.8, 1.5, P[2] + 1.6], [P[0] - 2.2, 1.45, P[2] + 1.2], lin(t, 5.17, 7.19)), look: [W[0], 1.2, W[2]], fov: 40, wellLight: 1, actors: [FIRE(0.4), brother(7, P, ry, {aR: ARMS.point}), {k: 'well', rope: 1.2, ripple: 0}]}}; }
      const g1 = G(F[0] - 2.0, F[2] + 0.2), g2 = G(F[0] - 3.0, F[2] - 0.5), ry = face(F, T0);
      return {dark: k(t, 9.0, 9.24), w: {...base, pos: mv([F[0] - 0.6, 1.35, F[2] + 0.9], [F[0] - 1.6, 1.3, F[2] + 0.5], lin(t, 7.19, 9.24)), look: [3, 1.1, 1.2], fov: 40, actors: [FIRE(0.3), brother(0, g1, ry), brother(4, g2, ry + 0.1)]}};
    }
    case 3: {
      const tm0 = 0.38, fp = G(-0.8, 2.6), bp = G(0.7, 2.6);
      const base = (extra: Partial<Extract<Actor, {k: 'h'}>> = {}): Actor[] => [father(fp, Math.PI / 2 - 0.4, {sit: 1, ...extra}), boy(bp, -Math.PI / 2 + 0.3, {sit: 1})];
      if (t < 1.79) { const u = lin(t, 0, 1.79); return {w: {pos: [4.5, 1.6, 10.3], look: [1.8, 1.1, 2.8], fov: 42, time: tm0, actors: [...base(), ...walkers(3, G(8, 5), G(4.6, 4.4), u, t, {spread: 0.8})]}}; }
      if (t < 4.2) { const u = lin(t, 1.79, 4.2), lead = G(2.6, 4.6), ry = face(lead, [0.2, 0, 2.6]); return {w: {pos: mv([4.2, 1.5, 7.0], [3.7, 1.45, 6.2], u), look: [0.2, 1.0, 2.7], fov: 40, time: tm0, actors: [...base(), brother(3, lead, ry, {aL: [1.25, 0.35, 0.6], aR: [1.25, 0.35, 0.6]}), brother(4, G(3.7, 5.3), ry), brother(6, G(3.2, 5.9), ry)]}}; }
      if (t < 6.86) { const u = lin(t, 4.2, 6.86); return {w: {pos: mv([1.8, 1.0, 4.8], [1.3, 0.95, 4.2], u), look: [-0.3, 0.95, 2.6], fov: 40, time: tm0, actors: base({aR: ARMS.over})}}; }
      if (t < 8.16) { const su = 1 - k(t, 6.9, 7.8); return {w: {pos: [-0.9, 0.55, 5.2], look: mv([-0.8, 0.9, 2.6], [-0.8, 1.5, 2.6], k(t, 6.86, 8.1)), fov: 44, time: tm0, actors: [father(G(-0.8, 2.6), Math.PI / 2 - 0.4, {sit: su}), boy(bp, -Math.PI / 2 + 0.3, {sit: 1})]}}; }
      if (t < 10.75) { const u = lin(t, 8.16, 10.75), ea = k(t, 8.6, 8.9) * (1 - k(t, 9.5, 9.68)), ep = G(-12.2, 12.4); return {w: {pos: mv([-0.8, 1.55, 3.0], [-1.5, 1.5, 4.2], u), look: [-12, 1.6, 12], fov: 42, time: 0.55, tent: false, actors: [{k: 'eyes', p: [ep[0], ep[1] + 0.45, ep[2]], a: ea} as Actor]}}; }
      if (t < 11.86) return {w: {pos: [2.2, 1.2, 6.4], look: [-0.8, 1.15, 2.6], fov: 40, time: 0.5, actors: [father(G(-0.8, 2.6), face(G(-0.8, 2.6), [8, 0, 6]), {aL: ARMS.down, aR: ARMS.down, head: [0, 0.12]})]}};
      const u = lin(t, 11.86, 14.71), a: V3 = [2.6, 0, 4.2], b: V3 = [14, 0, 8];
      return {dark: 0.5 * k(t, 13.8, 14.71), w: {pos: mv([-1.4, 1.5, 4.6], [-4.2, 3.4, 9.8], u), look: mv([4, 1.0, 5], [8, 1.0, 6.4], u), fov: 44, time: 0.45, actors: [father(G(-0.8, 2.6), face(G(-0.8, 2.6), [8, 0, 6])), ...walkers(3, a, b, u, t, {spread: 0.7}), {...boy(G(a[0] + (b[0] - a[0]) * u + 0.1, a[2] + (b[2] - a[2]) * u - 0.6), Math.atan2(b[0] - a[0], b[2] - a[2]), {walk: t * 6.6})}]}};
    }
    case 4: {
      const cx = W[0], cz = W[2];
      if (t < 1.94) { const u = lin(t, 0, 1.94); return {w: {pos: mv([cx - 3.4, 1.1, cz + 3.8], [cx - 3.0, 1.1, cz + 3.3], u), look: [cx, 0.9, cz], fov: 42, time: 0.25, tent: false, wellLight: 0.6, actors: [{k: 'well', rope: 2.6, ripple: 0}, ...[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + 0.6, p = G(cx + Math.cos(a) * 1.9, cz + Math.sin(a) * 1.9); return brother(BR[i], p, face(p, [cx, 0, cz]), {lean: i % 2 ? 0.35 : 0.12, aL: ARMS.reach, aR: ARMS.reach}); })]}}; }
      if (t < 3.37) return {w: {pos: [cx + 0.001, 4.2 - 1.0 * lin(t, 1.94, 3.37), cz + 0.001], look: [cx, 0, cz], fov: 40, time: 0.25, tent: false, wellLight: 1, actors: [{k: 'well', rope: 3.0, ripple: lin(t, 2.6, 3.37)}]}};
      if (t < 5.52) { const u = lin(t, 3.37, 5.52), a: V3 = [12, 0, 6.6], b: V3 = [4, 0, 5], c = mv(a, b, u); return {w: {pos: [8.5, 1.2, 12.6], look: [7.5, 1.1, 5.6], fov: 26, time: 0.3, actors: [...walkers(5, a, b, u, t, {arms: (i) => (i === 2 ? {aR: [0.8, 0.15, 1.0]} : {})}), {k: 'shirt', p: add(G(c[0], c[2]), [0.15, 0.95, 0.35]), pose: 'held', open: 0.1, stain: 1, t} as Actor]}}; }
      if (t < 8.43) { const wide: Partial<Extract<Actor, {k: 'h'}>> = t > 6.3 ? {aL: ARMS.wide, aR: ARMS.wide} : {}; return {w: {pos: mv([-1.25, 1.1, 3.3], [-1.2, 1.1, 3.5], lin(t, 5.51, 8.43)), look: [-0.3, 1.2, 6.6], fov: 40, time: 0.45, actors: [father(G(-0.8, 4.4), 0, {sit: 1}), ...[-2, -0.9, 0.3, 1.4].map((x, i) => brother(BR[i + 1], G(x, 6.6), Math.PI, wide)), {k: 'light', p: [-0.8, 1.5, 3.0], color: '#ffb25a', i: 8, d: 10}]}}; }
      const u = lin(t, 8.43, 11.57), bp = G(0.3, 3.9);
      return {dark: k(t, 11.3, 11.57), w: {pos: mv([0.45, 1.25, 6.2], [0.4, 1.22, 5.1], u), look: [0.25, 1.15, 4.7], fov: 38, time: 0.45, actors: [brother(3, bp, 0, {aR: [1.35, 0.1, 0.25], aL: [0.2, 0.2, 0.2]}), {k: 'shirt', p: hand(bp, 0, [0.25, 1.15, 0.85]), pose: 'held', open: 0.1, stain: 1, t} as Actor, {k: 'light', p: [0.9, 1.5, 5.6], color: '#ffb25a', i: 7, d: 8}]}};
    }
    case 5: {
      const tm0 = 0.55, fire = (r = 0.4, f = 0, d = 0) => FIRE(r, f, d);
      if (t < 2.84) { const u = lin(t, 0, 2.84), op = k(t, 0.2, 1.5), hp = G(0.3, 2.9); return {w: {pos: mv([0.5, 1.25, 5.4], [0.4, 1.25, 4.7], u), look: [0.3, 1.3, 3.45], fov: 38, time: tm0, actors: [brother(3, hp, 0, {aL: [1.4, 0.45, 0.5], aR: [1.4, 0.45, 0.5]}), {k: 'shirt', p: [0.3, 1.35, 3.45], pose: 'held', open: op, stain: 1, t} as Actor]}}; }
      if (t < 5.38) { const u = lin(t, 2.84, 5.38); const sp = G(F[0] - 1.3, F[2] + 0.3); return {w: {pos: mv(add(F, [-5.4, 0.9, 0.4]), add(F, [-4.2, 0.9, 0.4]), u), look: add(F, [-0.8, 0.6, 0.2]), fov: 34, time: tm0, tent: false, actors: [fire(0.4), {k: 'sheep', p: sp, ry: Math.PI / 2 + 0.3} as Actor, brother(3, G(F[0] - 0.4, F[2] + 0.1), -Math.PI / 2, {aR: [0.9, 0.15, 0.6]})]}}; }
      if (t < 5.87) { const arm: [number, number, number] = [3.0 - 1.6 * k(t, 5.45, 5.8), 0.1, 0.2]; return {w: {pos: add(F, [-3.0, 0.9, 2.2]), look: add(F, [-4.4, 0.0, 0.4]), fov: 40, time: tm0, tent: false, actors: [fire(0.5, 0.3), brother(3, G(F[0] + 1.2, F[2]), -Math.PI / 2, {aR: arm, aL: [0.4, 0.2, 0.4]})]}}; }
      if (t < 8.44) { const u = lin(t, 5.87, 8.44), sp = G(F[0] - 2.2, F[2] + 1.6); return {w: {pos: mv(add(F, [-1.2, 2.4, 2.0]), add(F, [-1.7, 1.5, 1.6]), u), look: add(F, [-2.2, 0.0, 1.6]), fov: 42, time: tm0, tent: false, actors: [fire(0.5), {k: 'shirt', p: [sp[0], sp[1] + 0.03, sp[2]], ry: 0.6, pose: 'ground', stain: 0.55 + 0.45 * lin(t, 6.2, 8.2), t} as Actor, {k: 'puddle', p: [sp[0] - 0.7, 0, sp[2] + 0.3], r: 0.5} as Actor, brother(4, G(F[0] - 2.2, F[2] + 2.8), Math.PI, {sit: 1, aR: [1.9, 0.2, 0.25]})]}}; }
      if (t < 12.14) { const u = lin(t, 8.44, 12.14), c = G(F[0] - 2.2, F[2] + 1.6), a = Math.PI * u, r = 3.4, h = 1.0 + 2.0 * u; const av = lin(t, 8.6, 11.8); return {w: {pos: [c[0] + Math.cos(a) * r, c[1] + h, c[2] + Math.sin(a) * r], look: [c[0], c[1], c[2]], fov: 42, time: tm0 + 0.25 * u, tent: false, actors: [fire(0.7, 0, k(t, 8.5, 12)), {k: 'shirt', p: [c[0], c[1] + 0.03, c[2]], ry: 0.6, pose: 'ground', stain: 1, t} as Actor, ...walkers(3, G(F[0] - 1.6, F[2] + 2.4), G(F[0] + 6, F[2] + 4), av, t, {spread: 0.8})]}}; }
      const u = lin(t, 12.14, 12.59);
      return {w: {pos: mv([0.05, 1.45, 3.9], [0.0, 1.42, 3.8], u), look: [0.0, 1.38, 3.4], fov: 30, time: tm0 + 0.25, actors: [{k: 'shirt', p: [0.3, 1.3, 3.4], pose: 'held', stain: 1, seam: u, t} as Actor]}};
    }
    default: {
      const fp = G(-0.5, 2.6), tm = 0.6;
      if (t < 1.43) return {w: {pos: [-0.2, 1.5, 3.7], look: [-0.5, 0.62, 3.0], fov: 32, time: tm, actors: [father(fp, 0.3, {sit: 1, aR: [0.9, 0.0, 2.0]}), {k: 'shirt', p: [-0.5, 0.62, 3.05], pose: 'lap', stain: 1, t} as Actor]}};
      if (t < 3.2) { const u = lin(t, 1.43, 3.2), fl = 22 * Math.exp(-Math.abs(t - 2.44) * 9); return {w: {pos: mv([0.2, 1.1, 5.2], [0.1, 1.1, 4.5], u), look: [-0.5, 1.05, 3.1], fov: 40, time: tm, actors: [father(fp, 0.3, {sit: 1, aL: [1.3, 0.3, 0.5], aR: [1.3, 0.3, 0.5]}), {k: 'shirt', p: [-0.5, 1.1, 3.15], ry: 0.3, pose: 'held', stain: 1, t} as Actor, {k: 'light', p: [0, 1.4, 3.7], color: '#ffd9a0', i: fl, d: 8}]}}; }
      if (t < 6.6) { const u = lin(t, 3.2, 6.6), a = (-20 + 50 * u) * Math.PI / 180, r = 3.2, push = t > 4.93; return {w: {pos: [-0.5 + Math.sin(a) * r, 1.25, 2.6 + Math.cos(a) * r], look: [-0.5, 1.05, 2.6], fov: 40, time: tm, actors: [father(fp, 0.3, {sit: 1, aR: push ? [0.6, 0.9, 0.4] : [0.9, 0.0, 2.0], head: [0, 0.2]}), {k: 'shirt', p: [-0.5, 0.62, 3.0], pose: 'lap', stain: 1, t} as Actor, ...[[3.4, 7.8], [4.2, 8.2], [2.6, 8.6]].map(([x, z], i) => brother(BR[i + 2], G(x, z), face(G(x, z), fp)))]}}; }
      if (t < 10.64) { const u = lin(t, 6.6, 10.64); return {w: {pos: mv([-0.4, 1.3, 4.6], [-1.8, 3.9, 11.2], u), look: mv([-0.4, 0.9, 2.6], [0, 0.8, 2.8], u), fov: 42, time: 0.6 + 0.25 * u, actors: [father(fp, 0.3, {sit: 1, head: [0, 0.5], aR: ARMS.rest}), {k: 'shirt', p: [0.4, 0.03, 3.4], pose: 'ground', stain: 1, t} as Actor]}}; }
      if (t < 13.29) return {w: {pos: mv([W[0] - 5.2, 0.8, W[2] + 4.2], [W[0] - 2.3, 0.9, W[2] + 2.3], lin(t, 10.64, 13.29)), look: [W[0], 0.8, W[2]], fov: 42, time: 1, tent: false, wellLight: 1.3, actors: [{k: 'well', rope: 1.4, ripple: 0}]}};
      const u = lin(t, 13.29, 15.25);
      return {dark: k(t, 14.6, 15.2), w: {pos: mv([W[0], 3.4, W[2] + 0.01], [W[0], 2.3, W[2] + 0.01], u), look: [W[0], 0, W[2]], fov: 40, time: 1, tent: false, wellLight: 1, actors: [{k: 'well', rope: 1.4, ripple: lin(t, 14.0, 14.9)}]}};
    }
  }
};

const BEDS: Record<number, [string, number][]> = {1: [['wind', 0.08], ['crickets', 0.05]], 2: [['drone', 0.1], ['flame', 0.06], ['wind', 0.05]], 3: [['drone', 0.1], ['crickets', 0.04], ['wind', 0.05]], 4: [['wind', 0.07], ['crickets', 0.04]], 5: [['flame', 0.1], ['drone', 0.1]], 6: [['drone', 0.14], ['wind', 0.06]]};
const EVENTS: Record<number, [number, string, number][]> = {
  1: [[0, 'steps', 0.25], [1.78, 'steps', 0.25], [5.6, 'cloth', 0.3], [7.0, 'boom', 0.25], [10.9, 'boom', 0.3], [13.25, 'riser', 0.25], [17.63, 'bell', 0.2]],
  2: [[3.94, 'crackle', 0.3], [5.17, 'whoosh', 0.25], [8.15, 'riser', 0.3]],
  3: [[0, 'steps', 0.2], [4.2, 'cloth', 0.2], [7.0, 'steps', 0.2], [8.6, 'wolf', 0.35], [9.68, 'riser', 0.25], [11.86, 'steps', 0.3], [14.14, 'boom', 0.25]],
  4: [[0, 'creak', 0.3], [2.6, 'splash', 0.45], [3.37, 'steps', 0.3], [10.5, 'cloth', 0.3], [10.77, 'riser', 0.3]],
  5: [[1.5, 'cloth', 0.35], [1.6, 'boom', 0.3], [3.5, 'sheep', 0.35], [5.49, 'thud', 0.35], [6.0, 'cloth', 0.3], [12.14, 'shimmer', 0.3]],
  6: [[0, 'cloth', 0.2], [2.44, 'boom', 0.3], [4.93, 'cloth', 0.25], [9.7, 'bell', 0.2], [10.64, 'creak', 0.2], [14.0, 'drip', 0.4]],
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), ws = (words as any)[String(n)] as TimedWord[];
  const o = shot(n, t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Desert2 w={o.w} t={t} />
      <Vignette strength={0.5} />
      <Grain opacity={0.045} />
      {(o.dark ?? 0) > 0.001 && <AbsoluteFill style={{background: '#000', opacity: Math.min(1, o.dark!)}} />}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

export const Yusuf2: React.FC<{guide?: boolean; audioOnly?: boolean}> = ({guide = false, audioOnly = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        {!audioOnly && <Scene n={n} />}
        <Audio src={staticFile(`vo-67/card-${String(n).padStart(2, '0')}.wav`)} />
        <SoundBed beds={BEDS[n]} events={EVENTS[n]} />
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const Yusuf2Cover: React.FC = () => {
  loadFonts();
  const o = shot(5, 2.2);
  return (
    <AbsoluteFill style={{background: '#05060c'}}>
      <Desert2 w={o.w} t={3} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 840, background: 'linear-gradient(to bottom, rgba(5,6,12,0), rgba(5,6,12,.7) 16%, rgba(5,6,12,.7) 84%, rgba(5,6,12,0))'}} />
      <Vignette strength={0.55} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 52, letterSpacing: 4, padding: '12px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>YUSUF · 2-QISM</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1}}>
        <div style={{position: 'relative', display: 'inline-block', fontSize: 150, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>BO'RI YEDI?!
          <div style={{position: 'absolute', left: -20, right: -20, top: '52%', height: 18, background: '#ff3b30', borderRadius: 9, transform: 'rotate(-4deg)', boxShadow: '0 0 36px rgba(255,59,48,.85)'}} />
        </div>
        <div style={{fontSize: 118, color: '#ff6a5a', marginTop: 14, textShadow: '0 0 60px rgba(255,100,80,.6), 0 10px 40px rgba(0,0,0,.8)'}}>OTA ISHONMADI</div>
        <div style={{fontSize: 56, color: GOLD2, marginTop: 26, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Nega ota ishonmadi?</div>
      </div>
    </AbsoluteFill>
  );
};
