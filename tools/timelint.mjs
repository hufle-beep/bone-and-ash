#!/usr/bin/env node
// v0.11.273 (owner pick P41-A, TL): the times lint, log only (tools/lib/timelint.mjs). Not in check.sh: run it before a
// balance push on the times.
//   node tools/timelint.mjs          the counts and, by kind, the choices off Rules Engine C's times
//   node tools/timelint.mjs --list   and every choice off them (scene:index, class, default → engine, its text)
import { SCENES } from '../js/story/prologue.js';
import '../js/core/tasks.js'; // the task hubs' menus are timeless among themselves (setTimeless)
import { defaultMinutes } from '../js/core/story.js';
import { lintTimes, timeLintLines, textOfChoice } from './lib/timelint.mjs';

for (const l of timeLintLines(lintTimes(SCENES, defaultMinutes, textOfChoice), { list: process.argv.includes('--list') })) console.log(l);
