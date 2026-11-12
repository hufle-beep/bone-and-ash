package android.net;
public abstract class Uri implements android.os.Parcelable {
    public abstract String getHost();
    public abstract String getLastPathSegment();
    public static Uri parse(String uriString) { return null; }
}
