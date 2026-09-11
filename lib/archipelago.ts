/**
 * Point generation for the Archipelago — the site-wide background.
 *
 * Two positions per point: where it starts (a loose drifting field) and
 * where it belongs (a chain of islands). The shader lerps between them
 * against a single `uProgress` uniform that GSAP drives.
 *
 * Since 2026-09-11 it is the background of every page (Jan's choice: the
 * recommended placement). The chain is scaled to the window's height and
 * sits on the RIGHT on wide windows — behind the bento, clear of the
 * headline and the lede — and centred on narrow ones, where there is no
 * side to put it on. A thin dust of loose points across the whole window
 * keeps the rest of the ground from looking empty. The canvas passes the
 * visible world size in; the layout is seeded, so it is the same every load.
 *
 * WHAT THIS IS NOT: a map of the Philippines. The islands are procedural —
 * a north-south chain with a few outliers, which reads as an archipelago
 * without claiming to be a coastline. Shipping an inaccurate outline of a
 * real country on the site of a developer who sells accuracy to that
 * country's government is a bad trade for a background effect.
 *
 * THE UPGRADE PATH, when it is worth the day it costs: replace `ISLANDS`
 * with points sampled inside a simplified Philippine polygon from a
 * public-domain source (Natural Earth 1:110m), sampled at build time into
 * a binary Float32Array. `buildPoints` keeps the same return shape.
 */

export type PointField = {
  target: Float32Array;
  scatter: Float32Array;
  seed: Float32Array;
  count: number;
};

/** Deterministic PRNG — the same field every load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Box–Muller, for cluster falloff that thins at the edges the way a
 *  coastline does rather than stopping at a hard circle. */
function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-6);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** x, y, radius, weight, in chain units (the chain spans about ±1.5 by
 *  ±2.3); weight is the share of island points. */
const ISLANDS: [number, number, number, number][] = [
  [-0.15, 1.5, 0.72, 0.26],
  [0.35, 0.55, 0.5, 0.16],
  [-0.55, 0.15, 0.34, 0.1],
  [0.15, -0.5, 0.56, 0.18],
  [-0.35, -1.25, 0.42, 0.12],
  [0.75, -1.6, 0.36, 0.1],
  [-1.15, -0.75, 0.22, 0.05],
  [1.2, 0.95, 0.18, 0.03],
];

/** Share of points that are loose dust across the whole window. */
const DUST = 0.06;

/**
 * @param count  total points
 * @param halfW  visible half-width, in world units at the points' plane
 * @param halfH  visible half-height, in world units at the points' plane
 */
export function buildPoints(
  count: number,
  halfW: number,
  halfH: number,
): PointField {
  const rand = rng(20260910);

  const target = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seed = new Float32Array(count);

  // Chain fits ~90% of the height; on a wide window it moves right.
  const s = (halfH * 0.9) / 2.3;
  const wide = halfW / halfH > 1.1;
  // 0.62 of the half-width: clear of the inner pages' ledes, which run to
  // ~75% of the window, while the chain stays inside the right edge.
  const ox = wide ? halfW * 0.62 : 0;

  const dust = Math.round(count * DUST);
  const islandCount = count - dust;
  const totalWeight = ISLANDS.reduce((a, i) => a + i[3], 0);

  let written = 0;
  const put = (tx: number, ty: number, tz: number) => {
    const i3 = written * 3;
    target[i3] = tx;
    target[i3 + 1] = ty;
    target[i3 + 2] = tz;
    // drifting field — a slab wider than the window the points arrive from
    scatter[i3] = (rand() - 0.5) * halfW * 2.6;
    scatter[i3 + 1] = (rand() - 0.5) * halfH * 2.6;
    scatter[i3 + 2] = (rand() - 0.5) * 3.2;
    seed[written] = rand();
    written++;
  };

  for (let k = 0; k < ISLANDS.length; k++) {
    const [cx, cy, r, w] = ISLANDS[k];
    const share =
      k === ISLANDS.length - 1
        ? islandCount - written
        : Math.round((w / totalWeight) * islandCount);
    for (let n = 0; n < share && written < islandCount; n++) {
      // gaussian cluster, slightly wider than tall
      put(
        ox + (cx + gauss(rand) * r * 0.62) * s,
        (cy + gauss(rand) * r * 0.46) * s,
        (rand() - 0.5) * 0.28,
      );
    }
  }

  while (written < count) {
    put(
      (rand() * 2 - 1) * halfW * 1.05,
      (rand() * 2 - 1) * halfH * 1.05,
      (rand() - 0.5) * 0.6,
    );
  }

  return { target, scatter, seed, count };
}