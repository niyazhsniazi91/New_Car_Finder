# Car Finder Web App

The web edition is a responsive, offline-capable car comparison app built from the 13 supplied vehicle brochures. It works in desktop and mobile browsers and can be installed as a Progressive Web App (PWA).

## What is included

- Overview dashboard with recommendations by driving use.
- Five brochure-assessed strict matches: automatic, 360° camera, and ADAS on a qualifying trim.
- Side-by-side comparison of up to four models selected from all 13 cars, combining brochure assessments and CarDekho-listed specifications with Bengaluru and Mumbai estimates.
- Filters for budget, city, seats, fuel, automatic type, and must-have features.
- Rankings for all cars in the brochure set.
- Local PDF brochure import, detail review, and library JSON export/import.

The Citroën Aircross X is identified as a 5+2-seat near-match, not a confirmed ADAS match. Check exact trim and equipment before making a purchase decision.

## Run locally

Requirements: Node.js 22.13+ (or 24+).

From PowerShell:

```powershell
cd "D:\NIYAZ NEW CAR SELECTION\car-finder"
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Open [http://localhost:4173](http://localhost:4173). The included server serves the generated `www` directory on port 4173.

## Host the web app

1. Run `npm.cmd install` and `npm.cmd run build`.
2. Publish the contents of the generated `www` folder to a static web host. Upload the contents, not a link to the source folder.
3. Configure the host to serve `index.html` at the site root and serve `.js`, `.json`, `.webmanifest`, and `.svg` files with suitable content types.
4. Use HTTPS for a hosted PWA. Service workers are not available on ordinary non-local HTTP sites.
5. Open the hosted address once while online. Allow the initial app shell and PDF reader files to finish loading before relying on offline access.
6. To deploy a changed app, rebuild and publish the new `www` contents. Reload while online so the new version is installed in the browser cache.

Avoid adding an external upload endpoint unless you intentionally want brochure contents to leave the device. By default, brochures are parsed in the browser and are not sent to a server.

## Install on a phone or computer

Open the HTTPS site in a supported browser while online. Use the browser's **Install app**, **Install Car Finder**, or **Add to Home Screen** option. The app can be opened from the new home-screen icon. Browser menus vary by device and browser version.

An installed PWA can reuse its cached app shell while offline. A first visit, a cleared browser cache, or a fresh browser profile requires an online visit to download the app files again.

## Data and privacy

- Imported PDF text and reviewed car details are stored in that browser's local IndexedDB storage.
- Browser storage is separate from the Android app and from other browsers/devices.
- Use **Brochure library → Export library** to create a JSON backup. In another installation, choose **Import library** and select that JSON file.
- Clearing site data, uninstalling/resetting a browser profile, or device cleanup can erase local imports. Export a backup if the data matters.
- There is no account, cloud database, or automatic cross-device synchronization.

## Supported brochure imports

Upload text-searchable PDFs from **Brochure library → Upload PDF brochures**. Image-only scanned PDFs are not OCR-processed and may be reported as unreadable. Imported text is only a starting point: open **Review details**, check the exact automatic trim, camera, ADAS and city prices, and save your review. An imported brochure is not treated as a strict match until its details have been reviewed and the confirmation box checked.

## Price notes

All shown prices are indicative estimates, not dealer offers. On-road prices vary by exact variant, registration, insurance, tax, accessories, and current offers. A model-level estimate is not necessarily the price of the qualifying automatic trim. Confirm a written, itemized quote with an authorised dealer.

## Related documentation

- [Android app README](./README-ANDROID.md)
- [App use guide](./USER_GUIDE.md)
- [Project build README](./README.md)
