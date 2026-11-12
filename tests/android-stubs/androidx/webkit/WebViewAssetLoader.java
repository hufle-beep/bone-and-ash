package androidx.webkit;
import android.net.Uri;
import android.webkit.WebResourceResponse;
public final class WebViewAssetLoader {
    public interface PathHandler { WebResourceResponse handle(String path); }
    public static final class AssetsPathHandler implements PathHandler {
        public AssetsPathHandler(android.content.Context context) { }
        public WebResourceResponse handle(String path) { return null; }
    }
    public static final class Builder {
        public Builder addPathHandler(String path, PathHandler handler) { return this; }
        public WebViewAssetLoader build() { return null; }
    }
    public WebResourceResponse shouldInterceptRequest(Uri url) { return null; }
}
