# New_Car_Finder

Finds Car Like Car Dekho with so many advanced features.

This repository contains the Car Finder web and Android apps, their source vehicle brochures, and the comparison deliverables.

## Project layout

- `car-finder/` — offline-capable web app and Capacitor Android project.
- `CAR BROCHURES/` — the 13 source PDFs used for the vehicle analysis.
- `CAR_COMPARISON.xlsx` — generated comparison workbook.
- `CAR_PRICE_COMPARISON.md` — detailed brochure and city-price report.

## Run the web app

Requirements: Node.js 22.13+ (or 24+).

```powershell
cd .\car-finder
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Open [http://localhost:4173](http://localhost:4173).

## Build project deliverables

See [Car Finder build and project guide](./car-finder/README.md), [web app guide](./car-finder/README-WEB.md), and [Android app guide](./car-finder/README-ANDROID.md).

`npm.cmd run workbook` regenerates the workbook. `npm.cmd run android:apk` builds the debug Android APK; it requires JDK 11 and Android SDK Platform 33. Generated web and Android build folders, local IDE settings, signing files, and APKs are excluded from Git.
