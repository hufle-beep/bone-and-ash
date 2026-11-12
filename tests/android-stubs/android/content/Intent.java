package android.content;
import android.net.Uri;
public class Intent implements android.os.Parcelable {
    public static final String ACTION_OPEN_DOCUMENT = "android.intent.action.OPEN_DOCUMENT";
    public static final String ACTION_CREATE_DOCUMENT = "android.intent.action.CREATE_DOCUMENT";
    public static final String ACTION_SEND = "android.intent.action.SEND";
    public static final String ACTION_VIEW = "android.intent.action.VIEW";
    public static final String CATEGORY_OPENABLE = "android.intent.category.OPENABLE";
    public static final String EXTRA_MIME_TYPES = "android.intent.extra.MIME_TYPES";
    public static final String EXTRA_TITLE = "android.intent.extra.TITLE";
    public static final String EXTRA_STREAM = "android.intent.extra.STREAM";
    public static final String EXTRA_SUBJECT = "android.intent.extra.SUBJECT";
    public static final int FLAG_GRANT_READ_URI_PERMISSION = 1;
    public static final int FLAG_ACTIVITY_NEW_TASK = 0x10000000;
    public Intent(String action) { }
    public Intent(String action, Uri uri) { }
    public Intent addCategory(String category) { return this; }
    public Intent setType(String type) { return this; }
    public Intent setDataAndType(Uri data, String type) { return this; }
    public Intent putExtra(String name, String value) { return this; }
    public Intent putExtra(String name, String[] value) { return this; }
    public Intent putExtra(String name, android.os.Parcelable value) { return this; }
    public void setClipData(ClipData clip) { }
    public Intent addFlags(int flags) { return this; }
    public Uri getData() { return null; }
    public static Intent createChooser(Intent target, CharSequence title) { return target; }
}
