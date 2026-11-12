package android.app;
import android.content.Intent;
import android.os.Bundle;
public abstract class Activity extends android.content.Context {
    public static final int RESULT_OK = -1;
    protected void onCreate(Bundle savedInstanceState) { }
    protected void onActivityResult(int requestCode, int resultCode, Intent data) { }
    protected void onPause() { }
    protected void onResume() { }
    protected void onSaveInstanceState(Bundle outState) { }
    protected void onDestroy() { }
    @Deprecated public void onBackPressed() { }
    public void setContentView(android.view.View view) { }
    public final void runOnUiThread(Runnable action) { }
    @Deprecated public void startActivityForResult(Intent intent, int requestCode) { }
    public boolean moveTaskToBack(boolean nonRoot) { return false; }
    @Override public java.io.File getCacheDir() { return null; }
    @Override public String getPackageName() { return null; }
    @Override public android.content.pm.PackageManager getPackageManager() { return null; }
    @Override public android.content.ContentResolver getContentResolver() { return null; }
    @Override public void startActivity(Intent intent) { }
}
