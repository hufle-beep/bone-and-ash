package android.webkit;
public class WebChromeClient {
    public abstract static class FileChooserParams { }
    public boolean onShowFileChooser(WebView webView, ValueCallback<android.net.Uri[]> filePathCallback, FileChooserParams fileChooserParams) { return false; }
}
