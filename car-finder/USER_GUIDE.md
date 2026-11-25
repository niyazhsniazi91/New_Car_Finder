# Car Finder — App Use Guide

This guide covers the shared features in the web/PWA and Android apps. Their main screens work the same way; the browser installation and Android APK installation steps are different.

## 1. Start the app

- **Web:** open the hosted app address, or run the local app as described in [README-WEB.md](./README-WEB.md).
- **Android:** install and open `CAR_FINDER_S23_ULTRA.apk` as described in [README-ANDROID.md](./README-ANDROID.md).
- On a new web installation, open the app online once and let it load before going offline.

The top of the Overview shows the strict-match count, an indicative lowest-price summary, and the number of brochures assessed. The city selector controls dashboard price context.

## 2. Explore the five strict matches

Open **Your matches** to see cars with a brochure-assessed automatic trim that has both a 360° camera and ADAS. Each card shows:

- The qualifying trim/gearbox note.
- Seats, automatic type and fuel options.
- An indicative ex-showroom range.
- An indicative on-road range for the selected city.
- **Details & sources** for the assessment, brochure, and price caveats.
- **＋ Compare** to add the car to the comparison table.

Use the city selector to switch between Bengaluru and Mumbai. Equipment is trim-specific: confirm the exact engine/gearbox/trim combination and current equipment with an authorised dealer.

The Citroën Aircross X appears as a near-match, not an exact match: it offers a 5+2 seat arrangement, but the brochure does not establish ADAS and lists the 360° camera as a paid dealer accessory.

## 3. Compare cars

Open **Compare** and tick any cars from the full 13-car catalogue. Select up to four cars. The table compares:

- Brochure range, qualifying trim, equipment fit, powertrain, and findings.
- Ex-showroom and Bengaluru/Mumbai indicative price ranges.
- CarDekho-listed engine, output, gearbox, fuel economy, dimensions, capacities, chassis, tyres, and safety details.
- Direct links to the CarDekho spec listing and brochure filename.

CarDekho specifications were reviewed on 25 November 2026 and are a snapshot of the displayed listing, which may represent one variant; brochure information describes the brochure's model range. Equipment and technical details can vary by trim. The comparison selection is temporary to the current browser/app session; it is not the same as a saved shortlist.

## 4. Filter your shortlist

Open **Smart filters**. Choose:

1. City used for the on-road estimate.
2. Maximum on-road budget.
3. Seat configuration.
4. Automatic gearbox type.
5. Fuel.
6. Primary usage.
7. Whether automatic, 360° camera and ADAS are required.

The three must-have boxes start selected. Relax them only if you are willing to consider cars without a documented feature. Use **Reset filters** to restore the initial settings. A filter may show no cars if its requirements are too restrictive.

Budget filtering uses available indicative price ranges. It is not a guaranteed final purchase price. Check the displayed trim and price range and get a dealer quote before deciding.

## 5. Read the rankings and recommendations

- **Overview** has use-case cards for family/mixed driving, city commuting, highway trips, value, and technology. Select one to update the recommendation.
- **Rankings** displays all cars, sorted by a heuristic fit score for the selected use case. Non-matches remain visible with a clear status.

Rankings are a decision aid—not a safety rating, road test, reliability forecast, or ownership-cost calculation. Consider your own priorities and arrange a test drive.

## 6. Add a brochure

1. Open **Brochure library**.
2. Select **Upload PDF brochures** or **Choose files** (on a computer, you can also drop PDFs into the drop area).
3. Pick one or more PDF files and wait for extraction to finish.
4. Select **Review details** beside each imported brochure.
5. Correct the make, model, seat count, automatic types, fuels, prices, qualifying trim and notes.
6. Check the 360° camera or ADAS boxes only if the brochure confirms that feature on the specific automatic trim.
7. Tick the confirmation box only after you have checked the brochure's exact trim/engine/gearbox matrix, then save.

Text extraction finds possible terms; it does not prove a feature is fitted to every variant. Only a reviewed and confirmed record with all required features is counted as a strict match. Enter price ranges only when you have a source you trust.

Text-searchable PDFs are supported. Scanned, image-only PDFs need OCR, which is not included; use a selectable-text brochure instead. PDF files are processed on the device and are not sent to an upload server.

## 7. Back up or transfer your library

- Choose **Export library** to download a JSON file containing imported cars and their reviewed details.
- On the other app/device, open **Brochure library → Import library** and select that JSON file.
- This is a manual transfer. Web and Android imports do not synchronize automatically.
- Keep a backup before clearing browser/app data or uninstalling the app.

The original 13-car catalog is built into the app. A library export contains locally imported records, not an automatic cloud backup.

## 8. Use offline

- **Web/PWA:** first open the hosted app while online so the browser caches the app shell and PDF reader. Thereafter, open the installed PWA from its app/home-screen icon. A browser cache clear, new device/profile, or browser privacy cleanup may require another online visit.
- **Android:** open the installed app; the interface, built-in car data, and bundled PDF reader are packaged on-device.
- Imported library data is stored locally in the corresponding browser or Android installation.

If offline content appears unavailable, reconnect to the internet, open the web app once, wait for it to finish loading, and try again. A new APK update needs to be installed; it does not update itself from the web app.

## 9. Understand prices and feature evidence

All prices are approximate, indicative ranges—not exact quotations. On-road prices change with registration location, tax, insurance selection, accessories, and current offers. For some models, a published model range may be shown as context because an exact qualifying-trim quote was not separately available. Ask an authorised dealer for a current itemized quote for the exact automatic trim.

When brochures list equipment in variant matrices, treat the exact variant, engine, fuel, and gearbox as part of the feature requirement. Confirm these details before booking.
