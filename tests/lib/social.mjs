// v0.11.160 (owner pick NX2, CN): the Sociable bot model's talk doors with Ya and Mei Lin, by their hub card labels
// (tests/models.test.mjs; checked against the story in tests/tools.test.mjs, both ways). RV1 (SX, Opus's M2): seven doors, each label
// matched whole up to its first full stop: "Eat with the others" is Ya's first meal (ya_mocks), "Find Mei Lin and Ya" the trio scene
// (trio_kiss, once a Coil), and "Find Mei Lin" no longer takes it by its first words.
export const SOCIAL_LABELS = ['Eat with the others', 'Talk to Ya', 'Find Ya', "Ya's gone", 'Talk to Mei Lin', 'Find Mei Lin', 'Find Mei Lin and Ya'];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const SOCIAL = new RegExp(`^(${SOCIAL_LABELS.map(esc).join('|')})(?:\\.|$)`);
