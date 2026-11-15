import {interpolate} from 'remotion';
export type TimedWord = {w: string; s: number; e: number};
export const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const tm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], cl);
export const ease = (x: number) => x * x * (3 - 2 * x);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const kf = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return k[i][1] + (k[i + 1][1] - k[i][1]) * ease((t - k[i][0]) / (k[i + 1][0] - k[i][0] || 1));
  return k[k.length - 1][1];
};
export const blinkAt = (t: number, seed = 0) => { const p = (t + seed * 1.7) % 3.3; return p < 0.15 ? Math.sin((p / 0.15) * Math.PI) : 0; };
const dist = (t: number, w: TimedWord) => (t < w.s ? w.s - t : t > w.e ? t - w.e : 0);
export const env = (t: number, ws: TimedWord[]) => 1 - tm(Math.min(9, ...ws.map((w) => dist(t, w))), 0, 0.45);
export const mouthOf = (t: number, ws: TimedWord[], seed = 0) => (ws.some((w) => t >= w.s && t <= w.e) ? 0.3 + 0.7 * Math.abs(Math.sin(t * 15 + seed)) : 0);
/** жест говорящего: рука поднимается, кисть «рубит» в такт, голова кивает */
export const gest = (t: number, e: number, seed: number) => ({
  R: [20 + 10 * Math.sin(t * 2.4 + seed) * e, 6 - e * (118 + 16 * Math.sin(t * 3.3 + seed * 2))] as [number, number],
  L: [12 + 5 * Math.sin(t * 1.7 + seed), 6 - e * 50 * Math.max(0, Math.sin(t * 1.3 + seed))] as [number, number],
  nod: e * (0.5 + 0.5 * Math.sin(t * 4.1 + seed)) * 0.7,
});
export const listen = (t: number, seed: number) => ({R: [10 + 2 * Math.sin(t * 0.9 + seed), 6] as [number, number], L: [10 + 2 * Math.sin(t * 1.1 + seed), 6] as [number, number], nod: 0.7 * Math.max(0, Math.sin(t * 1.2 + seed * 3)) ** 3});
export type CamKey = [number, number, number, number, number]; // u(0..1 в плане), масштаб, фокус x, фокус y, поворот
export type Shot = {from: number; keys: CamKey[]};
export const camNow = (shots: Shot[], t: number, L: number) => {
  let idx = 0; shots.forEach((sh, i) => { if (t >= sh.from * L - 1e-6) idx = i; });
  const a = shots[idx].from * L, b = (shots[idx + 1] ? shots[idx + 1].from : 1) * L, u = (t - a) / (b - a || 1), k = shots[idx].keys;
  let r = {s: k[0][1], x: k[0][2], y: k[0][3], r: k[0][4]};
  for (let i = 0; i < k.length - 1; i++) if (u >= k[i][0] && u <= k[i + 1][0]) { const q = ease((u - k[i][0]) / (k[i + 1][0] - k[i][0] || 1)), A = k[i], B = k[i + 1]; r = {s: A[1] + (B[1] - A[1]) * q, x: A[2] + (B[2] - A[2]) * q, y: A[3] + (B[3] - A[3]) * q, r: A[4] + (B[4] - A[4]) * q}; }
  if (u > k[k.length - 1][0]) { const l = k[k.length - 1]; r = {s: l[1], x: l[2], y: l[3], r: l[4]}; }
  return {...r, idx};
};
