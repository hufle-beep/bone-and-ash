package android.webkit;
public class WebViewClient {
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) { return null; }
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return false; }
}
