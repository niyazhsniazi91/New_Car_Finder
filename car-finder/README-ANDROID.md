# Car Finder Android App

Car Finder for Android packages the same web app and car catalog in a native Android wrapper. The provided debug APK is intended for direct testing and installation, including on the Samsung Galaxy S23 Ultra.

## Download and install

Use the APK in the project folder above `car-finder`:

`D:\NIYAZ NEW CAR SELECTION\CAR_FINDER_S23_ULTRA.apk`

On a Samsung Galaxy S23 Ultra:

1. Transfer the APK to the phone (for example, with USB, a trusted file-transfer method, or a private cloud drive).
2. On the phone, open **My Files** and locate `CAR_FINDER_S23_ULTRA.apk`.
3. Tap the APK. If Android asks, allow **Install unknown apps** for the app used to open the APK (such as My Files or the browser). Only enable this for a source you trust.
4. Return to the APK and choose **Install**. Open **Car Finder** when installation finishes.
5. If Android blocks the installation, check that the APK completed transferring and that the approving source has permission to install apps. Turn the permission back off after installation if you do not need it.

This is a debug-signed APK, not a Play Store release. Android may show a sideloading warning. It requires Android 6.0 or later (minimum SDK 23); the generated APK targets Android 15 (SDK 35). Actual installation/behavior should still be confirmed on the target handset.

## Build a fresh APK

Requirements on the build computer:

- Node.js 22.13+ (or 24+).
- JDK 21.
- Android SDK Platform 35 and Build Tools 35.0.0.

In PowerShell, from the `car-finder` folder:

```powershell
$env:JAVA_HOME = "C:\path\to\jdk-21"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

npm.cmd install
npm.cmd run android:apk
```

The build refreshes the web assets, syncs Capacitor, creates the debug APK, and copies it to:

`D:\NIYAZ NEW CAR SELECTION\CAR_FINDER_S23_ULTRA.apk`

The Android Studio project is under `car-finder\android`. To install to a connected, authorised Android device with ADB:

```powershell
adb install -r "..\CAR_FINDER_S23_ULTRA.apk"
```

## Offline behavior

The bundled catalog and interface work without a network connection. PDF brochure reading is bundled in the app, so supported text-searchable PDFs can be imported offline. No user account or upload server is used.

Imported brochures and edited values are stored on that Android installation. They do not automatically appear in the web app or on another phone. Use **Brochure library → Export library** on the source installation, transfer the JSON file, then choose **Import library** on the destination installation.

## Updates

To update the installed Android app, build a new APK using the steps above and install it on the phone. For an update installation, retain the same application ID and signing key. The delivered debug key is appropriate for development/testing; distributing a Play Store release requires a production signing key, release build configuration, store listing, and separate device/release testing.

## Privacy and cautions

- Brochure text extraction runs locally in the app.
- Check the imported car details and confirm the exact trim before trusting a feature match.
- Prices are indicative estimates, not dealer quotations. Get a current written on-road quote for the specific city and variant.
- Keep backups of imported library JSON. Uninstalling or clearing app storage can remove locally stored imports.

## Related documentation

- [Web app README](./README-WEB.md)
- [App use guide](./USER_GUIDE.md)
- [Project build README](./README.md)
