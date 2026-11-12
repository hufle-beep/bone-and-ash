/** Bone and Ash — the game's files inside the Android app (v0.11.148, owner pick EX1; Selene's exportText, from
 * hufle-beep/Long-patience). No DOM here, so tests/appfiles.test.mjs runs it. The app (MainActivity.java) gives the page
 * AndroidBridge.shareFile(name, text) (Android's share sheet: Drive, Gmail, Files, a chat; it reports nothing back) and
 * AndroidBridge.exportFile(name, text) (Android's "save as" file picker; it answers window.onAndroidExport(ok, msg)).
 * A browser has neither and downloads as before. */
import { inApp } from './update.js';

/** Where a file goes: 'share' (the app's share sheet), 'file' (the app's file picker) or 'download' (a browser).
 * toFile asks for the file picker (the app's "Save to a file" buttons); without one, the share sheet. */
export function exportRoute(bridge, toFile) {
    const share = !!bridge && typeof bridge.shareFile === 'function';
    const file = !!bridge && typeof bridge.exportFile === 'function';
    if (share && !toFile) return 'share';
    if (file) return 'file';
    if (share) return 'share';
    return 'download';
}

/** The app's "Save to a file" buttons show only where the file picker is. */
export const canSaveToFile = (bridge) => exportRoute(bridge, true) === 'file';

/** The service worker (the browser's offline copy) only outside the app: the app's files are in the APK. */
export const wantsServiceWorker = (w, protocol) => !inApp(w) && protocol !== 'file:' && !!w?.navigator && 'serviceWorker' in w.navigator;

/** v0.11.148 (RX1, FN): the name to show after the file picker. Android hands back the last part of the file's address, which
 * is the file name only on the phone's own storage (Downloads gives "msf:1000012345", Drive an encoded id): a name that ends in
 * .json is shown as it is, anything else gives way to the name the game asked for. */
export const savedName = (msg, asked) => (/\.json$/i.test(String(msg || '')) || !asked ? String(msg || '') : asked);

/** RX1 (NL): where the app's answer shows: under the buttons on the Saves page or the recovery screen, else the notice bar. */
export const resultPlace = (menu, recoveryShown) => (menu === 'saves' || (!menu && recoveryShown) ? 'note' : 'bar');

/** The lines the game shows for the app's files (the app's own messages are shown as they come). */
export const FILE_TEXT = {
    saved: (name) => `Saved ${name}.`,
    failed: (msg) => `Export failed: ${msg}`,
    share: 'Choose where the file goes.',
    allDownloaded: 'All saves downloaded.',
    statusShared: 'The status could not be copied; it went to the share sheet as a text file.',
    errorShared: 'Shared',
    ghShared: 'The save could not be copied; it went to the share sheet as a text file. To share it, open the game\'s saves folder on GitHub and upload it there.', // RX1 (GW): no GitHub page opens
};
