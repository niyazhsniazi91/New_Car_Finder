import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.formatting.rule import ColorScaleRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "cars.json"
OUTPUT = ROOT.parent / "CAR_COMPARISON.xlsx"

NAVY = "171A35"
PURPLE = "7661C8"
PINK = "E96C9A"
CYAN = "56BEB8"
LIME = "D7F477"
PALE = "F2F1FA"
MID = "E3E1F1"
INK = "262642"
WHITE = "FFFFFF"
MUTED = "73748C"
ORANGE = "F5B968"
THIN = Side(style="thin", color="DDDCEC")


def money(value):
    return f"₹{value:.2f} lakh" if isinstance(value, (int, float)) else "Not stated"


def price_range(car, city, qualifying=False):
    if qualifying:
        key = "qualifyingBengaluruLakh" if city == "bengaluru" else "qualifyingMumbaiLakh"
        if car.get(key):
            return car[key]
    return car.get("bengaluruLakh" if city == "bengaluru" else "mumbaiLakh")


def style_title(ws, title, subtitle, last_col):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=last_col)
    cell = ws.cell(1, 1, title)
    cell.fill = PatternFill("solid", fgColor=NAVY)
    cell.font = Font(name="Aptos Display", size=21, bold=True, color=WHITE)
    cell.alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 38
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=last_col)
    sub = ws.cell(2, 1, subtitle)
    sub.fill = PatternFill("solid", fgColor=NAVY)
    sub.font = Font(name="Aptos", size=10, color="DAD8EF", italic=True)
    sub.alignment = Alignment(vertical="center", wrap_text=True)
    ws.row_dimensions[2].height = 30
    ws.sheet_view.showGridLines = False


def header_row(ws, row, labels):
    for column, label in enumerate(labels, 1):
        cell = ws.cell(row, column, label)
        cell.fill = PatternFill("solid", fgColor=PURPLE)
        cell.font = Font(name="Aptos", size=10, color=WHITE, bold=True)
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        cell.border = Border(bottom=Side(style="medium", color=PINK))
    ws.row_dimensions[row].height = 32


def finish_table(ws, header, last_row, last_col, name):
    if last_row >= header + 1:
        ref = f"A{header}:{ws.cell(last_row, last_col).coordinate}"
        table = Table(displayName=name, ref=ref)
        table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium4", showFirstColumn=False, showLastColumn=False, showRowStripes=True, showColumnStripes=False)
        ws.add_table(table)
    ws.freeze_panes = f"B{header + 1}"
    ws.auto_filter.ref = f"A{header}:{ws.cell(last_row, last_col).coordinate}"
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0


def width_columns(ws, widths):
    for letter, width in widths.items():
        ws.column_dimensions[letter].width = width


def add_rows(ws, start_row, rows):
    for row_index, row in enumerate(rows, start_row):
        for column, value in enumerate(row, 1):
            cell = ws.cell(row_index, column, value)
            cell.font = Font(name="Aptos", size=9, color=INK)
            cell.alignment = Alignment(vertical="top", wrap_text=True)
            cell.border = Border(bottom=THIN)
            if isinstance(value, str) and value.startswith("https://"):
                cell.hyperlink = value
                cell.style = "Hyperlink"
        ws.row_dimensions[row_index].height = 44


data = json.loads(SOURCE.read_text(encoding="utf-8"))
cardekho_specs = json.loads((ROOT / "src" / "cardekho-specs.json").read_text(encoding="utf-8"))
cars = data["cars"]
matches = [car for car in cars if car.get("matches")]
wb = Workbook()
overview = wb.active
overview.title = "Overview"

style_title(overview, "CAR FINDER  /  THE DECISION DASHBOARD",
            "Brochure-based shortlist · automatic transmission + 360° camera + ADAS · prices are indicative, not dealer quotations.", 10)
overview["A4"] = "Choose a city"
overview["A4"].font = Font(bold=True, color=INK)
overview["B4"] = "Bengaluru"
overview["A5"] = "Choose your drive"
overview["A5"].font = Font(bold=True, color=INK)
overview["B5"] = "Family & mixed use"
city_validation = DataValidation(type="list", formula1='"Bengaluru,Mumbai"')
usage_validation = DataValidation(type="list", formula1='"Family & mixed use,City / commute,Highway trips,Value for money,Features & technology"')
overview.add_data_validation(city_validation)
overview.add_data_validation(usage_validation)
city_validation.add(overview["B4"])
usage_validation.add(overview["B5"])
for cell in ("B4", "B5"):
    overview[cell].fill = PatternFill("solid", fgColor="FFF2D6")
    overview[cell].font = Font(bold=True, color=INK)
    overview[cell].alignment = Alignment(horizontal="center")

cards = [
    ("A7", "EXACT FEATURE MATCHES", f"=COUNTA('Strict Matches'!B6:B{5 + len(matches)})"),
    ("C7", "BROCHURES ANALYSED", f"=COUNTA('Full Catalog'!B6:B{5 + len(cars)})"),
    ("E7", "SEAT CONFIGURATION", "5 seats"),
    ("G7", "PRICE SNAPSHOT", data["prepared"]),
]
for position, label, value in cards:
    cell = overview[position]
    cell.value = label
    cell.font = Font(size=8, bold=True, color="D5D2EA")
    cell.fill = PatternFill("solid", fgColor=PURPLE)
    cell.alignment = Alignment(horizontal="center", vertical="center")
    value_cell = overview.cell(cell.row + 1, cell.column, value)
    value_cell.font = Font(size=17, bold=True, color=WHITE)
    value_cell.fill = PatternFill("solid", fgColor=NAVY)
    value_cell.alignment = Alignment(horizontal="center", vertical="center")
    overview.merge_cells(start_row=7, start_column=cell.column, end_row=7, end_column=cell.column + 1)
    overview.merge_cells(start_row=8, start_column=cell.column, end_row=8, end_column=cell.column + 1)
overview.row_dimensions[7].height = 27
overview.row_dimensions[8].height = 36

overview.merge_cells("A10:J10")
overview["A10"] = "YOUR BEST FIT BY HOW YOU DRIVE"
overview["A10"].fill = PatternFill("solid", fgColor=CYAN)
overview["A10"].font = Font(size=11, bold=True, color=NAVY)
overview["A10"].alignment = Alignment(vertical="center")
header_row(overview, 11, ["Use case", "Top recommendation", "Qualifying trim", "Ex-showroom estimate", "Bengaluru on-road", "Mumbai on-road", "Why it ranks", "", "", ""])
for i, use in enumerate(["family", "city", "highway", "value", "technology"], 12):
    title = {"family": "Family & mixed use", "city": "City / commute", "highway": "Highway trips", "value": "Value for money", "technology": "Features & technology"}[use]
    ordered = sorted(matches, key=lambda car: car.get("scores", {}).get(use, 0), reverse=True)
    best = ordered[0] if ordered else {}
    overview.cell(i, 1, title)
    overview.cell(i, 2, f"{best.get('make', '')} {best.get('model', '')}".strip())
    overview.cell(i, 3, best.get("qualifyingVariant", ""))
    overview.cell(i, 4, money((best.get("qualifyingExLakh") or best.get("exShowroomLakh") or [None])[0]) + " – " + money((best.get("qualifyingExLakh") or best.get("exShowroomLakh") or [None, None])[1]))
    overview.cell(i, 5, money((price_range(best, "bengaluru", True) or [None])[0]) + " – " + money((price_range(best, "bengaluru", True) or [None, None])[1]))
    overview.cell(i, 6, money((price_range(best, "mumbai", True) or [None])[0]) + " – " + money((price_range(best, "mumbai", True) or [None, None])[1]))
    overview.cell(i, 7, best.get("highlights", ""))
    for col in range(1, 8):
        overview.cell(i, col).fill = PatternFill("solid", fgColor=PALE if i % 2 == 0 else WHITE)
        overview.cell(i, col).font = Font(name="Aptos", size=9, color=INK, bold=col == 2)
        overview.cell(i, col).alignment = Alignment(vertical="top", wrap_text=True)
        overview.cell(i, col).border = Border(bottom=THIN)
    overview.row_dimensions[i].height = 48

overview.merge_cells("A19:J19")
overview["A19"] = "HOW TO READ THIS"
overview["A19"].fill = PatternFill("solid", fgColor=PINK)
overview["A19"].font = Font(bold=True, color=WHITE)
notes = [
    "Exact match means the brochure identifies an automatic trim/combination with both 360° camera and ADAS. Verify the currently sold trim and engine/gearbox combination with the brand.",
    "City on-road and ex-showroom figures are indicative ranges assembled from published price sources; tax, registration, insurance, accessories, discounts and updates can change the total.",
    "A 5+2 seat option is not a full adult seven-seat layout. The Citroën Aircross X is recorded as a near-match because the brochure does not establish ADAS and its 360° camera is an extra-cost dealer accessory.",
    "Use Smart Filter for changeable criteria; select a city, seat count, budget, fuel and transmission. Full Catalog preserves the complete set of 13 brochure assessments and source references.",
]
for i, note in enumerate(notes, 20):
    overview.merge_cells(start_row=i, start_column=1, end_row=i, end_column=10)
    overview.cell(i, 1, "• " + note)
    overview.cell(i, 1).font = Font(size=9, color=INK)
    overview.cell(i, 1).alignment = Alignment(wrap_text=True, vertical="center")
    overview.cell(i, 1).fill = PatternFill("solid", fgColor=PALE if i % 2 == 0 else WHITE)
    overview.row_dimensions[i].height = 30
width_columns(overview, {"A": 22, "B": 23, "C": 34, "D": 25, "E": 25, "F": 25, "G": 56, "H": 4, "I": 4, "J": 4})
overview.freeze_panes = "A11"

strict = wb.create_sheet("Strict Matches")
strict_headers = ["Rank", "Make", "Model", "Segment", "Seats", "Fuel", "Qualifying automatic trim", "Transmission", "Ex-showroom estimate (₹ lakh)", "Bengaluru on-road (₹ lakh)", "Mumbai on-road (₹ lakh)", "360° camera", "ADAS", "Powertrain", "Brochure assessment / caveat", "Price source", "Bengaluru source"]
style_title(strict, "THE SHORTLIST  /  STRICT FEATURE MATCHES", "Only cars whose brochure assessment records an automatic qualifying trim with both 360° camera and ADAS. Qualifying price ranges may remain indicative.", len(strict_headers))
header_row(strict, 5, strict_headers)
strict_rows = []
for rank, car in enumerate(matches, 1):
    strict_rows.append([
        rank, car["make"], car["model"], car["segment"], car["seats"], ", ".join(car["fuel"]),
        car["qualifyingVariant"], ", ".join(car["automaticTypes"]),
        f"{money((car.get('qualifyingExLakh') or car['exShowroomLakh'])[0])} – {money((car.get('qualifyingExLakh') or car['exShowroomLakh'])[1])}",
        f"{money(price_range(car, 'bengaluru', True)[0])} – {money(price_range(car, 'bengaluru', True)[1])}",
        f"{money(price_range(car, 'mumbai', True)[0])} – {money(price_range(car, 'mumbai', True)[1])}",
        "Yes · trim-specific", "Yes · trim-specific", car["powertrain"], car["highlights"], car["source"], car["citySource"]
    ])
add_rows(strict, 6, strict_rows)
finish_table(strict, 5, 5 + len(strict_rows), len(strict_headers), "StrictMatchesTable")
width_columns(strict, {"A": 9, "B": 17, "C": 22, "D": 20, "E": 9, "F": 18, "G": 48, "H": 19, "I": 29, "J": 29, "K": 29, "L": 19, "M": 16, "N": 58, "O": 68, "P": 53, "Q": 57})

catalog = wb.create_sheet("Full Catalog")
catalog_headers = ["ID", "Make", "Model", "Segment", "Seats", "Seat options", "Fuel", "Transmission options", "Automatic type", "Ex-showroom low", "Ex-showroom high", "Bengaluru on-road low", "Bengaluru on-road high", "Mumbai on-road low", "Mumbai on-road high", "360° camera on automatic", "ADAS on automatic", "Strict match", "Qualifying trim", "Boot (L)", "Powertrain / engine", "Brochure highlights / caveat", "Brochure file", "Price source", "Bengaluru price source", "Best for", "Qualifying ex-showroom low", "Qualifying ex-showroom high", "Qualifying Bengaluru on-road low", "Qualifying Bengaluru on-road high", "Qualifying Mumbai on-road low", "Qualifying Mumbai on-road high"]
style_title(catalog, "ALL BROCHURE ASSESSMENTS  /  FULL DATASET", "13 brochure records. Price columns are lakh rupees. Blank qualifying price fields fall back to the full model estimate; do not treat these as exact quotes.", len(catalog_headers))
header_row(catalog, 5, catalog_headers)
catalog_rows = []
for car in cars:
    ex = car.get("exShowroomLakh") or [None, None]
    blr, mum = car.get("bengaluruLakh") or [None, None], car.get("mumbaiLakh") or [None, None]
    qex = car.get("qualifyingExLakh") or [None, None]
    qblr = car.get("qualifyingBengaluruLakh") or [None, None]
    qmum = car.get("qualifyingMumbaiLakh") or [None, None]
    catalog_rows.append([
        car["id"], car["make"], car["model"], car["segment"], car["seats"],
        ", ".join(map(str, car.get("seatOptions", [car["seats"]]))), ", ".join(car["fuel"]),
        ", ".join(car["transmissions"]), ", ".join(car["automaticTypes"]),
        ex[0], ex[1], blr[0], blr[1], mum[0], mum[1],
        "Yes" if car.get("automaticCamera") else "No", "Yes" if car.get("automaticAdas") else "No",
        "Yes" if car.get("matches") else "No", car.get("qualifyingVariant"),
        car.get("bootLitres"), car.get("powertrain"), car.get("highlights") or car.get("nearMatch"),
        car.get("brochure"), car.get("source"), car.get("citySource"), ", ".join(car.get("bestFor", [])),
        qex[0], qex[1], qblr[0], qblr[1], qmum[0], qmum[1]
    ])
add_rows(catalog, 6, catalog_rows)
for row in range(6, 6 + len(catalog_rows)):
    for col in range(10, 16):
        catalog.cell(row, col).number_format = '0.00'
finish_table(catalog, 5, 5 + len(catalog_rows), len(catalog_headers), "FullCatalogTable")
width_columns(catalog, {"A": 20, "B": 19, "C": 24, "D": 22, "E": 9, "F": 15, "G": 22, "H": 38, "I": 20, "J": 16, "K": 16, "L": 20, "M": 20, "N": 19, "O": 19, "P": 18, "Q": 15, "R": 13, "S": 50, "T": 12, "U": 58, "V": 75, "W": 40, "X": 55, "Y": 60, "Z": 22, "AA": 20, "AB": 20, "AC": 24, "AD": 24, "AE": 23, "AF": 23})

detail = wb.create_sheet("Detailed Comparison")
detail_headers = ["Comparison item"] + [f"{car['make']} {car['model']}" for car in cars]
style_title(detail, "DETAILED SIDE-BY-SIDE  /  ALL 13 CARS", "Columns contain every brochure model. Compare transmission, trim fit, both city prices, powertrain, practicality, feature status and source notes.", len(detail_headers))
header_row(detail, 5, detail_headers)
detail_fields = [
    ("PRICE & CITY", "Ex-showroom estimate (₹ lakh)", lambda c: f"{money(c['exShowroomLakh'][0])} – {money(c['exShowroomLakh'][1])}"),
    ("PRICE & CITY", "Bengaluru on-road estimate (₹ lakh)", lambda c: f"{money(c['bengaluruLakh'][0])} – {money(c['bengaluruLakh'][1])}"),
    ("PRICE & CITY", "Mumbai on-road estimate (₹ lakh)", lambda c: f"{money(c['mumbaiLakh'][0])} – {money(c['mumbaiLakh'][1])}"),
    ("PRICE & CITY", "Qualifying-trim ex-showroom estimate", lambda c: f"{money(c['qualifyingExLakh'][0])} – {money(c['qualifyingExLakh'][1])}" if c.get("qualifyingExLakh") else "No exact qualifying trim estimate"),
    ("PRICE & CITY", "Qualifying-trim Bengaluru estimate", lambda c: f"{money(c['qualifyingBengaluruLakh'][0])} – {money(c['qualifyingBengaluruLakh'][1])}" if c.get("qualifyingBengaluruLakh") else "Model range only / not a quote"),
    ("PRICE & CITY", "Qualifying-trim Mumbai estimate", lambda c: f"{money(c['qualifyingMumbaiLakh'][0])} – {money(c['qualifyingMumbaiLakh'][1])}" if c.get("qualifyingMumbaiLakh") else "Model range only / not a quote"),
    ("VEHICLE BASICS", "Body style / segment", lambda c: c["segment"]),
    ("VEHICLE BASICS", "Seats (brochure set)", lambda c: f"{c['seats']}" + ("; 5+2 option" if 7 in c.get("seatOptions", []) else "")),
    ("VEHICLE BASICS", "Fuel choices", lambda c: ", ".join(c["fuel"])),
    ("VEHICLE BASICS", "Boot capacity", lambda c: f"{c['bootLitres']} L" if c.get("bootLitres") else "Not stated"),
    ("GEARBOX & FEATURES", "Transmission choices", lambda c: ", ".join(c["transmissions"])),
    ("GEARBOX & FEATURES", "Automatic types", lambda c: ", ".join(c["automaticTypes"])),
    ("GEARBOX & FEATURES", "360° camera on automatic", lambda c: "Yes; trim-specific" if c.get("automaticCamera") else "Not established"),
    ("GEARBOX & FEATURES", "ADAS on automatic", lambda c: "Yes; trim-specific" if c.get("automaticAdas") else "Not established"),
    ("GEARBOX & FEATURES", "Strict match", lambda c: "YES" if c.get("matches") else "No"),
    ("QUALIFYING VARIANT", "Exact trim / combination", lambda c: c["qualifyingVariant"]),
    ("POWERTRAIN", "Engine and outputs", lambda c: c["powertrain"]),
    ("CARDEKHO SPEC LISTING", "CarDekho listing note", lambda c: cardekho_specs.get(c["id"], {}).get("variantNote", "Not available")),
    ("CARDEKHO SPEC LISTING", "Engine", lambda c: cardekho_specs.get(c["id"], {}).get("engine", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Displacement", lambda c: cardekho_specs.get(c["id"], {}).get("displacement", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Maximum power", lambda c: cardekho_specs.get(c["id"], {}).get("power", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Maximum torque", lambda c: cardekho_specs.get(c["id"], {}).get("torque", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Cylinders", lambda c: cardekho_specs.get(c["id"], {}).get("cylinders", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Gearbox / drive", lambda c: cardekho_specs.get(c["id"], {}).get("gearbox", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Fuel economy", lambda c: cardekho_specs.get(c["id"], {}).get("mileage", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Fuel tank", lambda c: cardekho_specs.get(c["id"], {}).get("fuelTank", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Emission standard", lambda c: cardekho_specs.get(c["id"], {}).get("emissions", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Dimensions / wheelbase", lambda c: cardekho_specs.get(c["id"], {}).get("dimensions", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Ground clearance", lambda c: cardekho_specs.get(c["id"], {}).get("groundClearance", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Boot space", lambda c: cardekho_specs.get(c["id"], {}).get("boot", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Suspension", lambda c: cardekho_specs.get(c["id"], {}).get("suspension", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Brakes", lambda c: cardekho_specs.get(c["id"], {}).get("brakes", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Tyres", lambda c: cardekho_specs.get(c["id"], {}).get("tyres", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Safety equipment", lambda c: cardekho_specs.get(c["id"], {}).get("safety", "Not listed")),
    ("CARDEKHO SPEC LISTING", "Safety rating", lambda c: cardekho_specs.get(c["id"], {}).get("safetyRating", "Not listed")),
    ("SOURCES", "CarDekho specification page", lambda c: cardekho_specs.get(c["id"], {}).get("url", "Not available")),
    ("BROCHURE ANALYSIS", "Key highlights / why it does or does not qualify", lambda c: c.get("highlights") or c.get("nearMatch")),
    ("SOURCES", "Brochure PDF filename", lambda c: c["brochure"]),
    ("SOURCES", "Price source", lambda c: c["source"]),
    ("SOURCES", "City price source", lambda c: c["citySource"]),
]
row = 6
current_section = None
for section, label, extractor in detail_fields:
    if section != current_section:
        detail.cell(row, 1, section)
        for col in range(1, len(detail_headers) + 1):
            cell = detail.cell(row, col)
            cell.fill = PatternFill("solid", fgColor=CYAN)
            cell.font = Font(bold=True, color=NAVY, size=9)
        row += 1
        current_section = section
    detail.cell(row, 1, label)
    detail.cell(row, 1).font = Font(bold=True, color=INK, size=9)
    detail.cell(row, 1).fill = PatternFill("solid", fgColor=MID)
    detail.cell(row, 1).alignment = Alignment(wrap_text=True, vertical="top")
    for col, car in enumerate(cars, 2):
        cell = detail.cell(row, col, extractor(car))
        if isinstance(cell.value, str) and cell.value.startswith("https://"):
            cell.hyperlink = cell.value
            cell.style = "Hyperlink"
        cell.font = Font(size=8, color=INK)
        cell.alignment = Alignment(wrap_text=True, vertical="top")
        cell.fill = PatternFill("solid", fgColor=PALE if row % 2 == 0 else WHITE)
        cell.border = Border(bottom=THIN)
    detail.row_dimensions[row].height = 55 if label not in ("Engine and outputs", "Key highlights / why it does or does not qualify") else 82
    row += 1
detail.freeze_panes = "B6"
detail.column_dimensions["A"].width = 38
for col in range(2, len(detail_headers) + 1):
    detail.column_dimensions[detail.cell(5, col).column_letter].width = 29
detail.auto_filter.ref = f"A5:{detail.cell(row - 1, len(detail_headers)).coordinate}"

smart = wb.create_sheet("Smart Filter")
style_title(smart, "SMART FILTER  /  BUILD YOUR SHORTLIST", "Choose input values from the dropdowns. The live results below use Excel 365 dynamic FILTER formulas; the complete filterable source table is on Full Catalog.", 10)
inputs = [
    ("A4", "Maximum on-road budget (₹ lakh)", "B4", 24),
    ("A5", "City", "B5", "Bengaluru"),
    ("A6", "Seats", "B6", "Any"),
    ("A7", "Fuel", "B7", "Any"),
    ("A8", "Automatic type", "B8", "Any"),
    ("A9", "Require 360° camera", "B9", "Yes"),
    ("A10", "Require ADAS", "B10", "Yes"),
    ("A11", "Only strict matches", "B11", "Yes"),
]
for label_cell, label, value_cell, value in inputs:
    smart[label_cell] = label
    smart[label_cell].font = Font(bold=True, color=INK, size=10)
    smart[value_cell] = value
    smart[value_cell].fill = PatternFill("solid", fgColor="FFF2D6")
    smart[value_cell].font = Font(bold=True, color=INK)
    smart[value_cell].alignment = Alignment(horizontal="center")
smart["B4"].number_format = '0.0'
for choices, target in [
    ('"Bengaluru,Mumbai"', "B5"), ('"Any,5,7"', "B6"), ('"Any,Petrol,Diesel,CNG"', "B7"),
    ('"Any,DCT/DCA/DSG,AT,CVT/IVT,AMT"', "B8"), ('"Yes,No"', "B9"), ('"Yes,No"', "B10"), ('"Yes,No"', "B11")
]:
    validation = DataValidation(type="list", formula1=choices, allow_blank=False)
    smart.add_data_validation(validation)
    validation.add(smart[target])
smart["A13"] = "LIVE RESULTS  /  Excel 365 or newer required for the spill formula"
smart.merge_cells("A13:Z13")
smart["A13"].fill = PatternFill("solid", fgColor=CYAN)
smart["A13"].font = Font(bold=True, color=NAVY)
smart_headers = ["Make", "Model", "Segment", "Seats", "Fuel", "Automatic type", "Ex-showroom low", "Ex-showroom high", "Bengaluru on-road low (model range)", "Bengaluru on-road high (model range)", "Mumbai on-road low (model range)", "Mumbai on-road high (model range)", "360° camera", "ADAS", "Strict match", "Qualifying trim", "Powertrain", "Highlights", "Brochure"]
header_row(smart, 14, smart_headers)
last = 5 + len(cars)
criteria = (
    f"((IF('Smart Filter'!$B$5=\"Bengaluru\",IF('Full Catalog'!$AC$6:$AC${last}<>\"\",'Full Catalog'!$AC$6:$AC${last},'Full Catalog'!$L$6:$L${last}),IF('Full Catalog'!$AE$6:$AE${last}<>\"\",'Full Catalog'!$AE$6:$AE${last},'Full Catalog'!$N$6:$N${last}))<='Smart Filter'!$B$4)"
    f"*IF('Smart Filter'!$B$6=\"Any\",1,('Full Catalog'!$E$6:$E${last}=VALUE('Smart Filter'!$B$6))+((ISNUMBER(SEARCH(\"7\",'Full Catalog'!$F$6:$F${last})))*('Smart Filter'!$B$6=\"7\")))"
    f"*IF('Smart Filter'!$B$7=\"Any\",1,ISNUMBER(SEARCH('Smart Filter'!$B$7,'Full Catalog'!$G$6:$G${last})))"
    f"*IF('Smart Filter'!$B$8=\"Any\",1,IF('Smart Filter'!$B$8=\"DCT/DCA/DSG\",(ISNUMBER(SEARCH(\"DCT\",'Full Catalog'!$I$6:$I${last}))+ISNUMBER(SEARCH(\"DCA\",'Full Catalog'!$I$6:$I${last}))+ISNUMBER(SEARCH(\"DSG\",'Full Catalog'!$I$6:$I${last})))>0,ISNUMBER(SEARCH('Smart Filter'!$B$8,'Full Catalog'!$I$6:$I${last}))))"
    f"*IF('Smart Filter'!$B$9=\"Yes\",'Full Catalog'!$P$6:$P${last}=\"Yes\",1)"
    f"*IF('Smart Filter'!$B$10=\"Yes\",'Full Catalog'!$Q$6:$Q${last}=\"Yes\",1)"
    f"*IF('Smart Filter'!$B$11=\"Yes\",'Full Catalog'!$R$6:$R${last}=\"Yes\",1))"
)
smart["A15"] = f'=FILTER(CHOOSECOLS(\'Full Catalog\'!$B$6:$W${last},1,2,3,4,6,8,9,10,11,12,13,14,15,16,17,18,20,21,22),{criteria},"No cars match these selections")'
smart["A15"].font = Font(color=INK, size=9)
smart.freeze_panes = "A15"
width_columns(smart, {"A": 21, "B": 23, "C": 20, "D": 10, "E": 17, "F": 20, "G": 17, "H": 18, "I": 20, "J": 20, "K": 20, "L": 20, "M": 15, "N": 12, "O": 14, "P": 48, "Q": 55, "R": 70, "S": 38})
for row_num in range(4, 12):
    smart.row_dimensions[row_num].height = 23

ranking = wb.create_sheet("Rankings")
rank_headers = ["Rank", "Make", "Model", "Use case", "Use-case score (1–5)", "Value / price score (1–5)", "Required feature score (1–5)", "Practicality score (1–5)", "Weighted score /100", "Match status", "Bengaluru on-road", "Mumbai on-road", "Qualifying trim", "Reason / context"]
style_title(ranking, "RANKINGS  /  A TRANSPARENT DECISION AID", "All 13 cars are ranked. Exact matches score higher on must-have feature fit; near-matches remain visible with clear status. 45% use-case · 20% price · 20% features · 15% practicality. Sort Rank after changing usage.", 19)
ranking["A4"], ranking["B4"] = "Choose usage", "Family & mixed use"
ranking["A4"].font = Font(bold=True, color=INK)
ranking["B4"].fill = PatternFill("solid", fgColor="FFF2D6")
ranking["B4"].font = Font(bold=True, color=INK)
usage_dv = DataValidation(type="list", formula1='"Family & mixed use,City / commute,Highway trips,Value for money,Features & technology"')
ranking.add_data_validation(usage_dv)
usage_dv.add(ranking["B4"])
header_row(ranking, 6, rank_headers)
for col, label in enumerate(["Family & mixed use", "City / commute", "Highway trips", "Value for money", "Features & technology"], 15):
    ranking.cell(6, col, label)
    ranking.cell(6, col).font = Font(bold=True, color=WHITE)
rank_rows = []
ranking_cars = sorted(cars, key=lambda car: (
    car.get("scores", {}).get("family", 3) * .45
    + max(1, min(5, 5 - max(0, (min(car.get("bengaluruLakh", [30])[0], car.get("mumbaiLakh", [30])[0]) - 15) * .18))) * .20
    + ((bool(car.get("automaticTypes")) + bool(car.get("automaticCamera")) + bool(car.get("automaticAdas"))) / 3 * 5) * .20
    + (4 if (car.get("bootLitres") or 0) >= 400 else 3.5) * .15
), reverse=True)
for car in ranking_cars:
    idx = len(rank_rows) + 7
    low = min(car.get("bengaluruLakh", [30])[0], car.get("mumbaiLakh", [30])[0])
    price_score = max(1, min(5, 5 - max(0, low - 15) * 0.18))
    practicality = 4 if (car.get("bootLitres") or 0) >= 400 else 3.5
    feature_score = round((bool(car.get("automaticTypes")) + bool(car.get("automaticCamera")) + bool(car.get("automaticAdas"))) / 3 * 5, 1)
    blr, mum = price_range(car, "bengaluru", True), price_range(car, "mumbai", True)
    rank_rows.append([
        f"=RANK(I{idx},I$7:I${6 + len(cars)},0)", car["make"], car["model"],
        "=$B$4", f"=INDEX(O{idx}:S{idx},1,MATCH($B$4,$O$6:$S$6,0))", round(price_score, 1), feature_score, practicality,
        f"=ROUND((E{idx}*0.45+F{idx}*0.20+G{idx}*0.20+H{idx}*0.15)*20,0)",
        "Exact match" if car.get("matches") else "Does not meet all must-haves",
        f"{money(blr[0])} – {money(blr[1])}", f"{money(mum[0])} – {money(mum[1])}",
        car["qualifyingVariant"], car.get("highlights") or car.get("nearMatch"),
        car.get("scores", {}).get("family", 3), car.get("scores", {}).get("city", 3),
        car.get("scores", {}).get("highway", 3), car.get("scores", {}).get("value", 3),
        car.get("scores", {}).get("technology", 3)
    ])
add_rows(ranking, 7, rank_rows)
for row_index, car in enumerate(ranking_cars, 7):
    ranking.cell(row_index, 7, round((bool(car.get("automaticTypes")) + bool(car.get("automaticCamera")) + bool(car.get("automaticAdas"))) / 3 * 5, 1))
    for col in range(15, 20):
        ranking.cell(row_index, col).font = Font(size=8, color=INK)
        ranking.cell(row_index, col).alignment = Alignment(vertical="top")
finish_table(ranking, 6, 6 + len(rank_rows), len(rank_headers), "RankingTable")
ranking.conditional_formatting.add(f"I7:I{6 + len(rank_rows)}", ColorScaleRule(start_type="min", start_color="F7B1C1", mid_type="percentile", mid_value=50, mid_color="FFE59D", end_type="max", end_color="C8EB8A"))
width_columns(ranking, {"A": 9, "B": 19, "C": 25, "D": 23, "E": 20, "F": 20, "G": 22, "H": 20, "I": 19, "J": 30, "K": 30, "L": 30, "M": 50, "N": 75})
for col in ("O", "P", "Q", "R", "S"):
    ranking.column_dimensions[col].hidden = True

sources = wb.create_sheet("Sources & Notes")
style_title(sources, "SOURCES, ASSUMPTIONS & LIMITATIONS", "Traceable source URLs and interpretation notes for responsible use of this comparison.", 5)
source_headers = ["Model", "Brochure PDF filename", "Published price source", "Bengaluru price source", "Important assessment / price caveat"]
header_row(sources, 5, source_headers)
source_rows = [[f"{c['make']} {c['model']}", c["brochure"], c["source"], c["citySource"], c.get("highlights") or c.get("nearMatch") or "Verify exact trim and current offer."] for c in cars]
add_rows(sources, 6, source_rows)
for row_index in range(6, 6 + len(cars)):
    for col in (3, 4):
        cell = sources.cell(row_index, col)
        if isinstance(cell.value, str) and cell.value.startswith("https://"):
            cell.hyperlink = cell.value
            cell.style = "Hyperlink"
finish_table(sources, 5, 5 + len(source_rows), len(source_headers), "SourceNotesTable")
width_columns(sources, {"A": 26, "B": 42, "C": 55, "D": 60, "E": 95})
note_start = 22
sources.merge_cells(start_row=note_start, start_column=1, end_row=note_start, end_column=5)
sources.cell(note_start, 1, "Pricing methodology")
sources.cell(note_start, 1).fill = PatternFill("solid", fgColor=CYAN)
sources.cell(note_start, 1).font = Font(bold=True, color=NAVY)
source_notes = [
    data["priceNote"],
    "On-road estimates can differ materially by registration jurisdiction, insurance provider/cover, accessories, handling charges, active offers and variant. Confirm the full written on-road quote with an authorised dealer in the selected city.",
    "When a trim-specific price range is not separately documented, a model-level range may appear as context. It is not represented as the exact price of the qualifying automatic trim.",
    "Feature fit is judged using the supplied brochures. Equipment is often variant-, engine- and gearbox-specific; verify the exact selected vehicle and current model year before purchase.",
    "CarDekho specifications reviewed 25 November 2026 are a snapshot of the displayed spec listing and can represent one variant. Compare them with the brochure's model-range information and verify the exact trim before purchase.",
    "Citroën Aircross X brochure seat configuration is 5+2. Its brochure does not establish ADAS and lists a 360° camera as a dealer accessory, so it is not counted as an exact match.",
    "Ranking is a transparent heuristic, not a crash-test score, reliability forecast, ownership-cost estimate or substitute for a test drive.",
]
for index, note in enumerate(source_notes, note_start + 1):
    sources.merge_cells(start_row=index, start_column=1, end_row=index, end_column=5)
    cell = sources.cell(index, 1, "• " + note)
    cell.alignment = Alignment(wrap_text=True, vertical="center")
    cell.font = Font(size=9, color=INK)
    cell.fill = PatternFill("solid", fgColor=PALE if index % 2 else WHITE)
    sources.row_dimensions[index].height = 35

overview.sheet_properties.tabColor = PINK
strict.sheet_properties.tabColor = LIME
detail.sheet_properties.tabColor = PURPLE
smart.sheet_properties.tabColor = CYAN
ranking.sheet_properties.tabColor = ORANGE
catalog.sheet_properties.tabColor = "7D8BCE"
sources.sheet_properties.tabColor = "A7A7BC"
for sheet in wb.worksheets:
    sheet.sheet_view.zoomScale = 85
    sheet.sheet_properties.pageSetUpPr.fitToPage = True
    sheet.sheet_view.showGridLines = False

wb.calculation.fullCalcOnLoad = True
wb.calculation.forceFullCalc = True
wb.calculation.calcMode = "auto"
wb.save(OUTPUT)
print(f"Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes) with {len(wb.sheetnames)} sheets and {len(cars)} cars.")
