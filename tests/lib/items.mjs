// v0.11.25: the item names for tests that load one Act 1 part alone (tests/part.test.mjs). Importing prologue.js there would also
// install its hooks into the part's scenes (meridians, Yuki's scenes) and break the part's isolation, so the names are filled here.
// tests/data.test.mjs checks that these are exactly the game's ITEMS.
import { itemNames } from '../../js/core/game.js';
import { NEW_ITEMS } from '../../js/story/common.js';
import { ACT1_ITEMS } from '../../js/story/act1_common.js';
export const PROLOGUE_ITEM_IDS = ['hare_raw', 'jade_bracket', 'crimson_berry', 'spirit_grass', 'hairpin', 'jackal_fang', 'beast_core'];
export function fillItemNames() {
    for (const id of PROLOGUE_ITEM_IDS) itemNames[id] ||= { name: id };
    Object.assign(itemNames, NEW_ITEMS, ACT1_ITEMS);
    return itemNames;
}
