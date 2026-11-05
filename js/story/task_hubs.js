/**
 * Task hubs (v0.9.0, step 3a): which hub scenes run as Selene-style task cards when "Tasks (preview)" is on.
 * `menus`: sub-menus whose choices become cards (the walk there is folded into each card); `daily` is the
 * key the sub-menu marks on entry, so its cards can read "back tomorrow". Choices on the hub itself that lead
 * back to the hub (eat, rest, cultivate…) are cards too; everything else on the hub stays a story stop.
 * `evening`: where James comes to if he collapses (HP 0) during a task — the stand-in until the Coil (3c).
 */
import { nextEvening } from './ashfall.js';

export const TASK_HUBS = {
    wilds: {
        menus: { wild_forage: { label: 'Forage' }, wild_hunt: { label: 'Hunt' }, wild_train: { label: 'Practice' } },
        own: 'Camp chores',
        evening: 'camp',
    },
    ashfall: {
        menus: { clinic: { label: 'Clinic', daily: 'clinic' }, workshop: { label: 'Workshop', daily: 'workshop' }, drill: { label: 'Militia', daily: 'drill' } },
        own: 'Around the village',
        evening: nextEvening,
    },
};
