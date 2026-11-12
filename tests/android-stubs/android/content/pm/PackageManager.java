package android.content.pm;
public abstract class PackageManager {
    public static class NameNotFoundException extends Exception { }
    public abstract PackageInfo getPackageInfo(String packageName, int flags) throws NameNotFoundException;
    public abstract boolean canRequestPackageInstalls();
}
