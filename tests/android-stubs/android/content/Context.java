package android.content;
import java.io.File;
public abstract class Context {
    public abstract File getCacheDir();
    public abstract String getPackageName();
    public abstract android.content.pm.PackageManager getPackageManager();
    public abstract ContentResolver getContentResolver();
    public abstract void startActivity(Intent intent);
}
