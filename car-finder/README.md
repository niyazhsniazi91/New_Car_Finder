# Car Finder

Offline-first car comparison app and Android wrapper built from the 13 brochures in `..\CAR BROCHURES`.

## User documentation

- [Web app README](./README-WEB.md) — run, host, install, offline behavior, and web data.
- [Android app README](./README-ANDROID.md) — sideloading the APK and building updates.
- [App use guide](./USER_GUIDE.md) — dashboard, matches, compare, filters, rankings, brochure imports, and data transfer.

## Deliverables

- `..\CAR_COMPARISON.xlsx` — vibrant comparison workbook (dashboard, strict matches, detailed comparison, smart filters, rankings, full catalog, and sources).
- `..\CAR_PRICE_COMPARISON.md` — detailed brochure and city-price report.
- `android\app\build\outputs\apk\debug\app-debug.apk` — debug Android APK for installation/testing.
- `www\` — generated web app for local hosting or static-server deployment.

## Build

Requirements: Node.js 22.13+ (or 24+), Java 21, Android SDK Platform 35/build tools, and Python with `openpyxl`.

```powershell
npm.cmd install
npm.cmd run workbook
npm.cmd run build
npm.cmd run dev
```

Open `http://localhost:4173`. The service worker caches the app shell and PDF reader after the first successful online load. There are no remote font or analytics requests.

To generate the Android debug APK:

```powershell
$env:JAVA_HOME = "<path to JDK 21>"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
npm.cmd run android:apk
```

The Android wrapper packages the same `www` app, targets Android 15 / SDK 35, and is built for Android devices including the Samsung Galaxy S23 Ultra. The script copies the result to `..\CAR_FINDER_S23_ULTRA.apk`. A debug APK is for direct testing; a production Play Store release needs a separately configured signing key.

## Brochure imports and privacy

Use **Brochure library → Upload PDF brochures**. Text extraction happens locally in the browser/WebView; PDFs are not sent to a server. Selectable-text PDFs are supported; scanned image-only PDFs need OCR and are reported as unsupported when no text can be extracted. Imports are saved in that app installation's IndexedDB. Extracted feature terms are only suggestions: review the exact automatic trim and confirm its features before it can count as a match. Enter price ranges yourself if needed.

To move imported data between the web app and APK or another device, export the library JSON from one installation and import it in the other. There is no hosted account or automatic cross-device synchronization.

## Price and fit caveats

All displayed prices are indicative estimates, not dealer quotations. Exact on-road prices vary by trim, location, insurance, tax, accessories, and offers. The brochure set only supports five strict 5-seat matches. The Citroën Aircross X is recorded as a 5+2 near-match, not a confirmed ADAS match. Confirm exact feature/engine/gearbox fitment with an authorised dealer before booking.
