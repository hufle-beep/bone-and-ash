package android.webkit;
import android.os.Bundle;
public class WebView extends android.view.View {
    public WebView(android.content.Context context) { super(context); }
    public WebSettings getSettings() { return null; }
    public void setWebViewClient(WebViewClient client) { }
    public void setWebChromeClient(WebChromeClient client) { }
    public void addJavascriptInterface(Object object, String name) { }
    public WebBackForwardList restoreState(Bundle inState) { return null; }
    public WebBackForwardList saveState(Bundle outState) { return null; }
    public void loadUrl(String url) { }
    public void evaluateJavascript(String script, ValueCallback<String> resultCallback) { }
    public void pauseTimers() { }
    public void resumeTimers() { }
    public void onPause() { }
    public void onResume() { }
    public void destroy() { }
}
