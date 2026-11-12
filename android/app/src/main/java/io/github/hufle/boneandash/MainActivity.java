package io.github.hufle.boneandash;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Bone and Ash for Android (v0.11.145, owner pick AP1), adapted from Selene's wrapper (hufle-beep/Long-patience).
 * Hosts the game in a WebView. The whole game folder (index.html, js/, css/, art/, icons/) is copied into the
 * app's assets by .github/workflows/android.yml and served from https://appassets.androidplatform.net/assets/,
 * so it has a normal web origin: the ES modules load, and localStorage (the saves) persists between launches.
 * The app's saves are apart from the browser's (move one by Export in the browser, Import in the app).
 */
public class MainActivity extends Activity {
    private static final String START_URL = "https://appassets.androidplatform.net/assets/index.html";
    /** Runs the game's close save (js/main.js: window 'pagehide' → closeSave, which saves only if no other tab saved since). */
    private static final String SAVE_JS = "try{window.dispatchEvent(new Event('pagehide'))}catch(e){}";
    private static final int REQ_EXPORT = 41;
    private static final int REQ_IMPORT = 42;
    private static final int REQ_INSTALL_PERM = 43;
    private File pendingInstall;

    private WebView web;
    private String pendingExport;
    /** v0.11.148 (RX1, JE): a picker result that came back after Android closed the app; told to the game once its page has loaded. */
    private String pendingReport;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(0xFFECE8DF);   // the game's paper (css/style.css --paper)
        setContentView(web);

        WebSettings ws = web.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        ws.setAllowFileAccess(false);
        ws.setAllowContentAccess(false);
        ws.setTextZoom(100);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if ("appassets.androidplatform.net".equals(u.getHost())) return false;
                // Open outside links (token page, GitHub) in the phone's browser
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (pendingReport != null) { String m = pendingReport; pendingReport = null; report(false, m); }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain", "application/octet-stream"});
                try {
                    startActivityForResult(i, REQ_IMPORT);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START_URL);
    }

    /** Called from the game's "Export save file" button. */
    private class Bridge {
        @JavascriptInterface
        public void exportFile(final String name, final String content) {
            runOnUiThread(() -> {
                pendingExport = content;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/json");
                i.putExtra(Intent.EXTRA_TITLE, name);
                try {
                    startActivityForResult(i, REQ_EXPORT);
                } catch (Exception e) {
                    report(false, "no file picker available");
                }
            });
        }

        /** Called from the game's "Export save file" button: hands the file to Android's share sheet. */
        @JavascriptInterface
        public void shareFile(final String name, final String content) {
            runOnUiThread(() -> {
                try {
                    File dir = new File(getCacheDir(), "shares");
                    if (!dir.exists()) dir.mkdirs();
                    File[] old = dir.listFiles();
                    if (old != null) for (File f : old) f.delete();   // only the latest shared file is kept
                    File f = new File(dir, name.replaceAll("[^A-Za-z0-9._-]", "_"));
                    try (FileOutputStream out = new FileOutputStream(f)) { out.write(content.getBytes(StandardCharsets.UTF_8)); }
                    Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".files", f);
                    Intent s = new Intent(Intent.ACTION_SEND);
                    s.setType(name.endsWith(".json") ? "application/json" : "text/plain");
                    s.putExtra(Intent.EXTRA_STREAM, uri);
                    s.putExtra(Intent.EXTRA_SUBJECT, name);
                    s.setClipData(ClipData.newRawUri(name, uri));
                    s.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    Intent c = Intent.createChooser(s, "Share file"); // RX1 (JT): saves, the status and error texts
                    c.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(c);
                } catch (Exception e) {
                    report(false, e.getMessage() == null ? "could not share the file" : e.getMessage());
                }
            });
        }

        @JavascriptInterface
        public boolean isApp() { return true; }

        /** Downloads the newest APK from GitHub and opens Android's installer. */
        @JavascriptInterface
        public void downloadUpdate(final String url) {
            new Thread(() -> {
                try {
                    File dir = new File(getCacheDir(), "updates");
                    dir.mkdirs();
                    File out = new File(dir, "BoneAndAsh.apk");
                    HttpURLConnection c = null;
                    String target = url;
                    for (int hop = 0; hop < 6; hop++) {   // follow GitHub's redirects to its file host
                        c = (HttpURLConnection) new URL(target).openConnection();
                        c.setInstanceFollowRedirects(false);
                        c.setConnectTimeout(15000);
                        c.setReadTimeout(30000);
                        int code = c.getResponseCode();
                        if (code >= 300 && code < 400 && c.getHeaderField("Location") != null) {
                            target = new URL(new URL(target), c.getHeaderField("Location")).toString();
                            c.disconnect();
                            continue;
                        }
                        if (code != 200) throw new Exception("GitHub answered " + code);
                        break;
                    }
                    long total = c.getContentLengthLong(), done = 0;
                    int lastPct = -1;
                    try (InputStream in = c.getInputStream(); FileOutputStream fo = new FileOutputStream(out)) {
                        byte[] buf = new byte[32768];
                        int n;
                        while ((n = in.read(buf)) > 0) {
                            fo.write(buf, 0, n);
                            done += n;
                            if (total > 0) {
                                int pct = (int) (done * 100 / total);
                                if (pct / 5 != lastPct / 5) { lastPct = pct; post("progress", String.valueOf(pct)); }
                            }
                        }
                    }
                    runOnUiThread(() -> install(out));
                } catch (Exception e) {
                    post("error", "Download failed: " + (e.getMessage() == null ? "unknown error" : e.getMessage()));
                }
            }).start();
        }

        /** Build number of the installed app, used by the game to spot updates. */
        @JavascriptInterface
        public int versionCode() {
            try {
                PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
                return Build.VERSION.SDK_INT >= 28 ? (int) pi.getLongVersionCode() : pi.versionCode;
            } catch (Exception e) {
                return 0;
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_EXPORT) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingExport != null) {
                Uri uri = data.getData();
                try (OutputStream out = getContentResolver().openOutputStream(uri, "wt")) {
                    out.write(pendingExport.getBytes(StandardCharsets.UTF_8));
                    String name = uri.getLastPathSegment() == null ? "save file" : uri.getLastPathSegment();
                    report(true, name.substring(name.lastIndexOf('/') + 1));
                } catch (Exception e) {
                    report(false, e.getMessage() == null ? "could not write the file" : e.getMessage());
                }
            } else if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                // RX1 (JE): Android closed the app while the picker was open, so the text to write is gone (the picker made an empty file)
                pendingReport = "the game was closed while the picker was open; try again";
            }
            pendingExport = null;
        } else if (requestCode == REQ_INSTALL_PERM) {
            if (pendingInstall != null && Build.VERSION.SDK_INT >= 26 && getPackageManager().canRequestPackageInstalls()) {
                File f = pendingInstall;
                pendingInstall = null;
                install(f);
            } else {
                post("error", "Install permission was not given. You can try again from Settings.");
            }
        } else if (requestCode == REQ_IMPORT && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) result = new Uri[]{data.getData()};
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    private void install(File apk) {
        if (Build.VERSION.SDK_INT >= 26 && !getPackageManager().canRequestPackageInstalls()) {
            pendingInstall = apk;
            post("permission", "Allow Bone and Ash to install apps, then return here. The install will continue.");
            try {
                startActivityForResult(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getPackageName())), REQ_INSTALL_PERM);
            } catch (Exception e) {
                post("error", "Couldn't open the install permission screen.");
            }
            return;
        }
        try {
            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".files", apk);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
            post("ready", "Installer opened. Confirm the update; your saves are kept.");
        } catch (Exception e) {
            post("error", "Couldn't open the installer: " + e.getMessage());
        }
    }

    private void post(final String state, final String msg) {
        runOnUiThread(() -> web.evaluateJavascript("window.onAppUpdate && window.onAppUpdate("
                + JSONObject.quote(state) + "," + JSONObject.quote(msg) + ")", null));
    }

    private void report(boolean ok, String msg) {
        String js = "window.onAndroidExport && window.onAndroidExport(" + ok + "," + JSONObject.quote(msg) + ")";
        web.evaluateJavascript(js, null);
    }

    // True while the app is in the background: WebView timers are paused once the save has run
    private boolean inBackground = false;

    @Override
    protected void onPause() {
        // Make sure the game writes its save before Android may stop the app, then pause all
        // WebView timers (no wake-ups in the background). Skipped if the app came back meanwhile.
        // Bone and Ash is ES modules with no global save(): its own close save listens for 'pagehide' (js/main.js, closeSave).
        inBackground = true;
        if (web != null) web.evaluateJavascript(SAVE_JS, v -> { if (inBackground && web != null) web.pauseTimers(); });
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        inBackground = false;
        if (web != null) { web.resumeTimers(); web.onResume(); }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (web != null) web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        // Back sends the game to the background instead of closing it
        moveTaskToBack(true);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.evaluateJavascript(SAVE_JS, null);
            web.destroy();
        }
        super.onDestroy();
    }
}
