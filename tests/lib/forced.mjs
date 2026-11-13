// v0.11.163 (owner pick W1, the leftovers of v0.11.161): two bot rules of tests/models.test.mjs, in their own file so the tools
// test can check them without playing the models.
//   RS  Careful's and the Sociable's pick on a task screen with no story exit: a door it has not walked into today, else
//       "Rest an hour." (a plain wait, as a careful player would take it), else the old rule. Before: the first door every
//       time, so after the Blackroot's hunts were used ("Not now." in v0.11.161) it walked into a Hunt card and out again,
//       15 minutes a time, until the evening's exit opened (5,971 forced picks per 300 Careful games, 1,616 in v0.11.160).
//   NN  every model but Random skips "Not now." while another choice is open (the Completionist tried it as an untried
//       choice and lost a third of its hunt fights: the rot ape 99.0% → 90.1%). The random bots keep it.
//   HN1 (owner pick) Careful's and the Sociable's "under Fed 30 with food" count as a log line, not a NOTE: the story screens
//       where it happens have no Eat card, so a player can't eat there either (a what-if bot that eats on any screen: 921 → 0
//       per 300 games, Act 1 3.33 → 3.35 Coils, the rot ape 86.0% → 86.2%).

export const NOT_NOW = /^Not now\b/;
export const REST_HOUR = /^Rest an hour\b/;

/** NN: the choices without "Not now.", unless nothing else is open. */
export const skipNotNow = (choices) => { const r = choices.filter((c) => !NOT_NOW.test(c.label)); return r.length ? r : choices; };

/** The forced pick before v0.11.163 (every model; Random and the others keep it): the first door, else a card not done today, else the first. */
export const oldForcedPick = (open, done) => open.find((x) => x.kind === 'door') || open.find((x) => !done.has(x.id)) || open[0];

/**
 * RS: Careful's and the Sociable's forced pick. `walked`: the doors walked into while forced this Coil, as `id@day`
 * (models.test.mjs's dayKey); the pick is added to it.
 */
export function forcedPick(open, done, walked, day) {
    const key = (x) => `${x.id}@${day}`;
    const c = open.find((x) => x.kind === 'door' && !walked.has(key(x))) || open.find((x) => REST_HOUR.test(x.label)) || oldForcedPick(open, done);
    if (c) walked.add(key(c));
    return c;
}

/** HN1: the hungry count's log line: per game, the Fed bands (st.hungryFed: f20, f10, f0) and the five places it happens most. */
export function hungryLine(m, st) {
    const top = Object.entries(st.hungryAt || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => `${k} ${n}`).join(', ');
    const f = st.hungryFed || {};
    return `${m}: under Fed 30 with food, on story screens with no Eat card: ${st.hungry} times, ${(st.hungry / Math.max(1, st.games)).toFixed(1)} a game (Fed 20–29 / 10–19 / 0–9: ${f.f20 || 0} / ${f.f10 || 0} / ${f.f0 || 0}); most at ${top || '—'}`;
}
