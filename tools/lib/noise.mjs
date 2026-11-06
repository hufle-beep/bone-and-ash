// v0.11.21: how much a drift number wobbles by chance, from its own sample sizes.
// A rate p (in %) measured on n0 games in the baseline and n1 games now: when a change reshuffles the games (any change
// that uses the bots' random choices differently), the two are independent samples, so the difference has a standard
// error of sqrt(q (1 − q) (1/n0 + 1/n1)) with q = p / 100. tools/sanity.mjs prints a log-only line: numbers that moved more
// than K × that noise (and at least MIN points). Unchanged code moves by exactly 0 (fixed seeds), so any flag is real change.
// K and MIN were set from 10 replays of the bot games under other seeds (v0.11.21; numbers in the handover).

export const K = 3;
export const MIN = 2;

/** Standard error, in points, of the difference between a rate measured on n0 and on n1 samples. */
export function noise(p, n0, n1) {
    const q = Math.min(1, Math.max(0, p / 100));
    const v = Math.max(q * (1 - q), 0.25 / Math.max(n0, n1)); // a rate at 0% or 100% still has some noise
    return 100 * Math.sqrt(v * (1 / n0 + 1 / n1));
}

/** The band, in points: K × noise, at least MIN. */
export const band = (p, n0, n1, k = K, min = MIN) => Math.max(min, k * noise(p, n0, n1));

/** Did a number move by more than its band? b and m: { v: percent, n: samples }. */
export const flagged = (b, m, k = K, min = MIN) => Math.abs(m.v - b.v) > band((b.v + m.v) / 2, b.n, m.n, k, min);
