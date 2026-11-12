# Android stand-ins (v0.11.145, owner pick AP1)

Hand-written stand-ins for the Android and AndroidX classes `android/app/src/main/java/.../MainActivity.java` uses, with the
real signatures (checked exceptions, statics, nested classes), so `tests/android.test.mjs` can compile the wrapper with `javac`
here, where the Android SDK can't be downloaded. They catch Java errors and typos in our code; they can't catch a wrong Android
signature (only the GitHub build can). Not shipped, not used by the game. A new Android call in `MainActivity` needs its stand-in here.
