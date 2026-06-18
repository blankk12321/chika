from __future__ import annotations

import html
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path.home() / "Desktop" / "独立站"
ASSET_ROOT = ROOT / "assets" / "images"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

CURRENT_DEPTH = 0


CHIKA_DATA = {
    "company": {
        "name": "CHIKA Manufacturing",
        "full_name": "Dongguan Advance Card Information Technology Co., Ltd.",
        "location": "Dongguan, China",
        "established": "2018",
        "facility": "40,000 sqm total construction area",
        "team": "200+ employees",
    },
    "stats": [
        ("66 Sets", "Injection Molding Machines"),
        ("50T-400T", "Clamping Tonnage Range"),
        ("7 Sets", "CNC Machining Centers"),
        ("8 Sets", "Precision EDM Machines"),
        ("2 Sets", "High-Power Laser Cutters"),
        ("8 Sets", "Stamping / Punching Machines"),
        ("30+ Units", "Advanced QC & Inspection Devices"),
        ("16 Lines", "Integrated Assembly Lines"),
    ],
    "equipment": {
        "injection": [
            ("LK High-Speed Injection Molding Machines", "100T-400T", "15 Sets", "Equipped with automatic robotic arms"),
            ("Electric Precision Injection Machines", "50T-320T", "27 Sets", "SUMITOMO, FANUC and NISSEI for tight-tolerance components"),
            ("Hydraulic Injection Machines", "50T-320T", "24 Sets", "HAITIAN, YAN-HING and Jiaming for efficient batch production"),
        ],
        "tooling": [
            ("High-Speed CNC Machining Centers", "Precision mold making", "7 Sets", "MAKINO, MORI SEIKI and FANUC machining capability"),
            ("Precision EDM / Wire Cut Machines", "Intricate cavity processing", "8 Sets", "MAKINO and SODICK EDM capability"),
            ("Grinding & Milling Machines", "Surface and profile prep", "9 Sets", "Mold base, electrode and finishing support"),
        ],
        "metal": [
            ("Fiber Laser Cutting Machines", "6000W + 3000W", "2 Sets", "High-power sheet metal processing"),
            ("Large CNC Bending Machines", "Length 1m to 3m", "5 Sets", "Precision bending for enclosure programs"),
            ("Heavy-Duty Stamping / Press Machines", "Up to 110T", "8 Sets", "Batch metal parts and structural brackets"),
            ("Welding Stations", "Laser, argon arc and CO2", "10+ Stations", "Structural welding and sub-assembly support"),
        ],
        "quality": [
            ("Hexagon CMM", "3D dimensional analysis", "", "Coordinate measuring capability"),
            ("Nikon 2.5D Optical Measurement System", "Non-contact microscopic measurement", "", "Precision optical inspection"),
            ("RoHS 1.0 / 2.0 Spectrometer Tester", "Environmental compliance verification", "", "Material compliance checks"),
            ("Environmental Chambers & Reliability Testing", "High / low temperature, salt spray, vibration and abrasion", "", "Reliability validation"),
        ],
    },
    "industries": [
        ("Consumer Electronics", ["Smart wearables", "Two-color keyboards", "Optical components"]),
        ("Audio & Acoustics", ["TWS earbuds", "OWS open-ear headphones", "Bone conduction headsets"]),
        ("Automotive Components", ["Interior precision plastic parts", "Metal-plastic structural brackets"]),
        ("Kiosk & Self-Service Terminals", ["Heavy metal enclosures", "Integrated device shells", "Sub-assemblies"]),
    ],
    "trusted_brands": ["Baseus", "Anker", "Huawei", "QCY", "Philips", "Sennheiser", "Logitech", "Xiaomi", "Nokia"],
}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "image"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def clean_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def clean_site_outputs() -> None:
    dirs = [
        "precision-injection-molding",
        "injection-mold-tooling",
        "metal-plastic-manufacturing",
        "sheet-metal-fabrication",
        "equipment",
        "factory-strength",
        "quality-control",
        "request-a-quote",
        "products",
        "capabilities",
        "factory",
    ]
    files = ["about.html", "contact.html"]
    for directory in dirs:
        target = ROOT / directory
        if target.exists() and target.is_dir():
            shutil.rmtree(target)
    for file in files:
        target = ROOT / file
        if target.exists():
            target.unlink()


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def root_href(href: str) -> str:
    if href.startswith(("http", "mailto:", "tel:", "#", "/")):
        return href
    if href.startswith("../"):
        return href
    return "../" * CURRENT_DEPTH + href


def copy_asset(src: Path, category: str, prefix: str | None = None) -> str:
    dest_dir = ASSET_ROOT / category
    dest_dir.mkdir(parents=True, exist_ok=True)
    stem = slugify(prefix or src.stem)
    dest = dest_dir / f"{stem}{src.suffix.lower()}"
    i = 2
    while dest.exists():
        dest = dest_dir / f"{stem}-{i}{src.suffix.lower()}"
        i += 1
    shutil.copy2(src, dest)
    return rel(dest)


def copy_file_exact(src: Path, category: str, filename: str) -> str:
    dest = ASSET_ROOT / category / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return rel(dest)


def folder_images(folder_name: str, category: str, prefix: str) -> list[str]:
    folder = SOURCE / folder_name
    if not folder.exists():
        return []
    images: list[str] = []
    for src in sorted(folder.rglob("*")):
        if src.is_file() and src.suffix.lower() in IMAGE_EXTS:
            images.append(copy_asset(src, category, f"{prefix}-{src.stem}"))
    return images


def image_from_folder(folder_name: str, filename: str, category: str, new_name: str) -> str:
    src = SOURCE / folder_name / filename
    if not src.exists():
        raise FileNotFoundError(src)
    return copy_file_exact(src, category, new_name)


def single_image(filename: str, category: str, new_name: str | None = None) -> str:
    src = SOURCE / filename
    if not src.exists():
        raise FileNotFoundError(src)
    if new_name:
        return copy_file_exact(src, category, new_name)
    return copy_asset(src, category, src.stem)


def nav(current: str, logo: str) -> str:
    items = [
        ("Home", "index.html"),
        ("Products", "products/index.html"),
        ("Factory Strength", "factory-strength/index.html"),
        ("Quality", "quality-control/index.html"),
        ("RFQ", "request-a-quote/index.html"),
    ]
    links = "".join(
        f'<a class="{"active" if label == current else ""}" href="{root_href(href)}">{esc(label)}</a>'
        for label, href in items
    )
    return f"""
    <header class="site-header">
      <a class="brand" href="{root_href('index.html')}">
        <img src="{root_href(logo)}" alt="CHIKA Manufacturing logo">
        <span><strong>CHIKA Manufacturing</strong><em>Precision Injection Molding & Integrated Manufacturing</em></span>
      </a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="main-nav" data-main-nav>
        {links}
        <div class="mobile-drawer-contact" aria-label="Mobile RFQ contact">
          <a href="mailto:yunimentalworking@gmail.com">Email Contact</a>
          <a href="https://wa.me/8618938580209">WhatsApp Contact</a>
          <a class="mobile-rfq" href="{root_href('request-a-quote/index.html')}">Request a Quote</a>
        </div>
      </nav>
      <div class="header-contact" aria-label="RFQ contact">
        <a href="mailto:yunimentalworking@gmail.com">Email Contact</a>
        <a href="https://wa.me/8618938580209">WhatsApp Contact</a>
      </div>
    </header>
    <div class="nav-backdrop" data-nav-backdrop></div>
    """


def page_shell(title: str, description: str, current: str, logo: str, body: str, depth: int = 0) -> str:
    global CURRENT_DEPTH
    CURRENT_DEPTH = depth
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(title)}</title>
    <meta name="description" content="{esc(description[:158])}">
    <link rel="stylesheet" href="{root_href('styles.css')}">
  </head>
  <body>
    {nav(current, logo)}
    <main>{body}</main>
    <footer class="site-footer">
      <div>
        <strong>CHIKA Manufacturing</strong>
        <span>{esc(CHIKA_DATA['company']['full_name'])} | Dongguan, China</span>
      </div>
      <div class="footer-links">
        <a href="{root_href('request-a-quote/index.html')}">Request a Quote</a>
        <a href="mailto:yunimentalworking@gmail.com">yunimentalworking@gmail.com</a>
        <a href="https://wa.me/8618938580209">WhatsApp</a>
      </div>
    </footer>
    <script src="{root_href('script.js')}"></script>
  </body>
</html>
"""


def hero(title: str, subtitle: str, image: str, primary: str = "Request a Quote", secondary: str | None = None) -> str:
    secondary_label = "Request a Quote" if secondary and "request-a-quote" in secondary else "View Factory Strength"
    second = f'<a class="button ghost" href="{root_href(secondary)}">{secondary_label}</a>' if secondary else ""
    return f"""
      <section class="hero">
        <div class="hero-copy">
          <div class="trust-badge">ISO-certified Dongguan manufacturing base</div>
          <h1>{esc(title)}</h1>
          <p>{esc(subtitle)}</p>
          <div class="hero-actions">
            <a class="button primary" href="{root_href('request-a-quote/index.html')}">{esc(primary)}</a>
            {second}
          </div>
        </div>
        <div class="hero-media">
          <img src="{root_href(image)}" alt="{esc(title)}">
        </div>
      </section>
    """


def text_hero(title: str, subtitle: str, primary: str = "Request a Quote") -> str:
    return f"""
      <section class="hero text-only-hero">
        <div class="hero-copy">
          <div class="trust-badge">Free DFM review & NDA-protected RFQ</div>
          <h1>{esc(title)}</h1>
          <p>{esc(subtitle)}</p>
          <div class="hero-actions">
            <a class="button primary" href="#rfq">{esc(primary)}</a>
          </div>
        </div>
      </section>
    """


def section(title: str, intro: str, content: str, cls: str = "") -> str:
    return f"""
      <section class="section {cls}">
        <div class="section-head">
          <h2>{esc(title)}</h2>
          <p>{esc(intro)}</p>
        </div>
        {content}
      </section>
    """


def stat_grid(items: list[tuple[str, str]]) -> str:
    return '<div class="stat-grid">' + "".join(
        f'<article><strong>{esc(value)}</strong><span>{esc(label)}</span></article>' for value, label in items
    ) + "</div>"


def value_strips(items: list[str]) -> str:
    return '<div class="value-grid">' + "".join(f"<span>{esc(item)}</span>" for item in items) + "</div>"


def image_card(title: str, text: str, image: str, href: str | None = None) -> str:
    tag = "a" if href else "article"
    attr = f' href="{root_href(href)}"' if href else ""
    media = f'<img src="{root_href(image)}" alt="{esc(title)}">'
    if not href:
        media = f'<a class="zoomable" href="{root_href(image)}" data-lightbox>{media}</a>'
    return f"""
      <{tag} class="image-card"{attr}>
        {media}
        <div><h3>{esc(title)}</h3><p>{esc(text)}</p></div>
      </{tag}>
    """


def gallery(images: list[str], label: str) -> str:
    return '<div class="gallery-grid">' + "".join(
        f'<figure><a class="zoomable" href="{root_href(img)}" data-lightbox><img src="{root_href(img)}" alt="{esc(label)} {i}"></a><figcaption>{esc(Path(img).stem.replace("-", " ").title())}</figcaption></figure>'
        for i, img in enumerate(images, start=1)
    ) + "</div>"


def equipment_table(groups: list[str] | None = None) -> str:
    groups = groups or ["injection", "tooling", "metal", "quality"]
    labels = {
        "injection": "Injection Molding",
        "tooling": "Tooling & Mold Assets",
        "metal": "Metal Fabrication",
        "quality": "QA Lab Equipment",
    }
    blocks = []
    for group in groups:
        rows = "".join(
            f"<tr><td>{esc(name)}</td><td>{esc(spec)}</td><td>{esc(qty)}</td><td>{esc(feature)}</td></tr>"
            for name, spec, qty, feature in CHIKA_DATA["equipment"][group]
        )
        blocks.append(
            f"""
            <div class="table-block">
              <h3>{esc(labels[group])}</h3>
              <div class="table-scroll">
                <table><thead><tr><th>Equipment</th><th>Specification</th><th>Qty</th><th>Production Role</th></tr></thead><tbody>{rows}</tbody></table>
              </div>
            </div>
            """
        )
    return '<div class="equipment-tables">' + "".join(blocks) + "</div>"


def rfq_panel() -> str:
    return """
      <section class="rfq-section" id="rfq">
        <div class="rfq-copy">
          <h2>Start Your Custom Manufacturing Project</h2>
          <p>Free DFM review included with every quote. We help you optimize wall thickness, draft angles and gating systems to reduce costs before tooling begins.</p>
          <div class="rfq-assurance">
            <span>NDA Protected</span>
            <span>Upload STEP, STP, IGES, DWG, PDF or ZIP</span>
            <span>Low-volume trials to automated mass production</span>
          </div>
          <a class="nda-link" href="../CHIKA-Standard-NDA.pdf" download>Download CHIKA Standard NDA.pdf</a>
        </div>
        <form class="rfq-form dark" data-rfq-form>
          <label>Your Name *<input name="name" autocomplete="name" required></label>
          <label>Company Name *<input name="company" autocomplete="organization" required></label>
          <label>Business Email *<input name="email" type="email" autocomplete="email" required></label>
          <label>Country / Region *<input name="country" autocomplete="country-name" required></label>
          <label>Project Type<select name="projectType"><option>Injection Molding</option><option>Injection Mold Tooling</option><option>Metal-Plastic Assembly</option><option>Sheet Metal Fabrication</option><option>Full Turnkey Contract Manufacturing</option></select></label>
          <label>Material<input name="material" placeholder="ABS, PC, SECC..."></label>
          <label>Estimated Qty<input name="annualVolume" placeholder="e.g. 1,000 pcs"></label>
          <label>Surface Finish<input name="surfaceFinish" placeholder="Texture, plating, painting..."></label>
          <label class="full-field">Upload 3D / 2D CAD Files<input name="drawingUpload" type="file"></label>
          <label class="full-field">Project Details<textarea name="message" rows="5" placeholder="Describe tolerances, finish, assembly, testing, packaging or launch timing..." required></textarea></label>
          <input type="text" name="website" class="website-field" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="button primary full" type="submit">Submit RFQ for Free DFM Review</button>
          <p class="form-status" data-form-status>Upload securely. We are ready to sign our NDA or yours before reviewing files.</p>
        </form>
      </section>
    """


def cta_band(label: str = "Request a Quote") -> str:
    return f"""
      <section class="cta-band">
        <div>
          <h2>Ready to source from Dongguan?</h2>
          <p>Support from rapid prototyping and low-volume trials to high-volume automated mass production.</p>
        </div>
        <a class="button primary" href="{root_href('request-a-quote/index.html')}">{esc(label)}</a>
      </section>
    """


def write(path: str, text: str) -> None:
    dest = ROOT / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(text, encoding="utf-8")


def create_nda_pdf() -> None:
    pdf = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 582 >> stream
BT /F1 18 Tf 72 720 Td (CHIKA Manufacturing Standard NDA) Tj
/F1 11 Tf 0 -34 Td (This downloadable placeholder confirms CHIKA Manufacturing is ready to sign a mutual NDA) Tj
0 -16 Td (before reviewing customer drawings, CAD files, product designs, tooling data or technical files.) Tj
0 -26 Td (Please contact yunimentalworking@gmail.com for the formal signed NDA document.) Tj
0 -26 Td (WhatsApp: +86 18938580209) Tj
0 -40 Td (Confidential project files can be reviewed after NDA confirmation.) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000875 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
945
%%EOF
"""
    (ROOT / "CHIKA-Standard-NDA.pdf").write_bytes(pdf)


def build_pages(assets: dict[str, list[str]], logo: str) -> None:
    global CURRENT_DEPTH
    CURRENT_DEPTH = 0
    hero_img = assets["hero"][0]
    product_images = assets["products"]
    product_display_images = assets["productDisplay"]
    factory_images = assets["factory"]
    quality_images = assets["quality"]
    capability_images = assets["capabilities"]
    mold_image = assets["mold"][0]

    home = hero(
        "Precision Injection Molding & Metal-Plastic Integrated Manufacturing",
        "CHIKA Manufacturing helps global brands turn complex designs into high-quality production components. From custom mold tooling and high-precision injection molding to sheet metal fabrication, surface finishing and full assembly.",
        hero_img,
        "Request a Quote",
        "factory-strength/index.html",
    )
    home += section("One-Stop Manufacturing Capacity", "A supplier-screening snapshot built for US hardware teams and purchasing managers.", stat_grid(CHIKA_DATA["stats"]), "dense")
    home += section(
        "Manufacturing Programs We Support",
        "From 100 prototype parts to 500,000 mass-produced components, our engineering team supports DFM, tooling, molding, metal fabrication, testing and assembly.",
        '<div class="card-grid four">'
        + image_card("Precision Injection Molding", "66 molding machines from 50T to 400T for tight-tolerance and batch production.", hero_img, "precision-injection-molding/index.html")
        + image_card("Injection Mold Tooling", "7 CNCs, 8 EDMs and mold engineering for DFM, trial and maintenance.", capability_images[1], "injection-mold-tooling/index.html")
        + image_card("Metal-Plastic Manufacturing", "Plastic housings, metal brackets, inserts and integrated final assembly.", capability_images[0], "metal-plastic-manufacturing/index.html")
        + image_card("Sheet Metal Fabrication", "6000W + 3000W laser cutting, bending, stamping, welding and surface finishing.", assets["sheet"][0], "sheet-metal-fabrication/index.html")
        + "</div>",
    )
    home += section(
        "Product Display",
        "All prepared product display images are shown here as a direct visual entry for buyers.",
        gallery(product_display_images, "CHIKA product display"),
    )
    home += section(
        "Factory Proof",
        "Real images from the CHIKA Dongguan manufacturing base.",
        '<div class="proof-strip">'
        + image_card("40,000 sqm Facility", "Self-owned factory base for stable supply and long-term programs.", assets["campus"][0])
        + image_card("Injection + Metal + Tooling", "Integrated capacity under one supplier relationship.", capability_images[2])
        + image_card("Quality Lab", "Hexagon CMM, Nikon 2.5D, RoHS and reliability testing support.", quality_images[0])
        + "</div>",
    )
    home += cta_band()
    write("index.html", page_shell("CHIKA Manufacturing | Precision Injection Molding China", "CHIKA Manufacturing provides precision injection molding, tooling, sheet metal, assembly and QC in Dongguan, China.", "Home", logo, home))

    CURRENT_DEPTH = 1
    injection = hero(
        "Precision Injection Molding China",
        "66 injection molding machines from 50T to 400T for consumer electronics, audio earbuds, smart wearables, automotive plastic parts and industrial components.",
        hero_img,
        "Request Injection Molding Quote",
        "../equipment/index.html",
    )
    injection += section("Injection Capacity", "Electric precision machines and hydraulic batch-production machines support both tight-tolerance parts and stable mass production.", stat_grid([
        ("66 Sets", "Injection molding machines"),
        ("50T-400T", "Clamping tonnage range"),
        ("SUMITOMO / FANUC / NISSEI", "Electric precision machines"),
        ("HAITIAN / YAN-HING / Jiaming", "Hydraulic injection machines"),
    ]) + value_strips(["Free DFM review", "Wall thickness optimization", "Draft angle review", "Gating system suggestions", "Rapid prototyping", "Low-volume trials", "Automated mass production", "Final inspection reports"]))
    injection += section("Injection Molding Gallery", "Real molding and factory-capability images used for supplier evaluation.", gallery([hero_img] + capability_images, "Precision injection molding"))
    injection += section("Typical Applications", "Programs where molding accuracy, repeatability and surface quality matter.", value_strips(["Consumer electronics housings", "TWS / OWS earphone components", "Smart wearable parts", "Automotive plastic parts", "Industrial plastic components", "Kiosk plastic components"]))
    injection += section("RFQ to Shipment Flow", "Engineering support starts before quotation, not after tooling begins.", '<div class="process-line">' + "".join(f"<span>{esc(x)}</span>" for x in ["RFQ", "Free DFM Review", "Tooling", "Trial Run", "Sample Approval", "Mass Production", "Inspection", "Shipment"]) + "</div>")
    injection += cta_band("Request Injection Molding Quote")
    write("precision-injection-molding/index.html", page_shell("Precision Injection Molding China | CHIKA Manufacturing", "66 injection molding machines from 50T-400T with Free DFM review in Dongguan, China.", "Injection Molding", logo, injection, depth=1))

    tooling = hero(
        "Injection Mold Tooling China",
        "Mold engineering, DFM analysis, CNC machining, EDM, wire cutting, grinding, trial runs and mold maintenance for production-ready injection molding.",
        mold_image,
        "Request Tooling Quote",
        "../equipment/index.html",
    )
    tooling += section("Tooling Capabilities", "Our mold development workflow helps buyers reduce tooling risk before production approval.", value_strips(["DFM Analysis", "Mold Design", "CNC Machining", "EDM", "Wire Cutting", "Grinding", "Mold Trial", "Mold Maintenance", "45 Mold Technicians"]))
    tooling += section("Tooling Equipment", "Data-led proof for injection mold maker qualification.", equipment_table(["tooling"]))
    tooling += section("Tooling Gallery", "Updated mold development image and related factory-capability images.", gallery([mold_image] + capability_images, "Injection mold tooling"))
    tooling += cta_band("Request Tooling Quote")
    write("injection-mold-tooling/index.html", page_shell("Injection Mold Tooling China | CHIKA Manufacturing", "DFM, CNC, EDM and mold trial support for injection mold tooling in Dongguan, China.", "Tooling", logo, tooling, depth=1))

    integrated = hero(
        "Metal-Plastic Integrated Manufacturing",
        "CHIKA combines plastic housings, metal brackets, inserts, sheet metal parts, production fixtures, inspection and total assembly under one Dongguan manufacturing base.",
        capability_images[0],
        "Request Integrated Manufacturing Quote",
        "../quality-control/index.html",
    )
    integrated += section("Why It Matters", "US buyers reduce supplier handoffs when molding, metal parts, finishing, assembly and inspection are handled by one manufacturing partner.", value_strips(["Plastic housings + metal brackets", "Insert and structural programs", "Integrated assembly", "ERP / MES production coordination", "Aging and functional testing", "Export-ready packaging"]))
    integrated += section("Factory Proof Images", "Visual proof for the one-stop manufacturing position.", gallery(capability_images + assets["products"][:6], "Metal plastic integrated manufacturing"))
    integrated += cta_band("Request Integrated Manufacturing Quote")
    write("metal-plastic-manufacturing/index.html", page_shell("Metal-Plastic Manufacturing China | CHIKA Manufacturing", "Integrated plastic injection, sheet metal, assembly and QC manufacturing in Dongguan, China.", "Metal + Plastic", logo, integrated, depth=1))

    sheet = hero(
        "Sheet Metal Fabrication China",
        "High-power laser cutting, CNC bending, stamping up to 110T, welding, riveting, powder coating and assembly-ready metal fabrication.",
        assets["sheet"][0],
        "Request Sheet Metal Quote",
        "../equipment/index.html",
    )
    sheet += section("Sheet Metal Capability", "A heavy manufacturing base for enclosures, brackets, kiosk structures and integrated device shells.", equipment_table(["metal"]))
    sheet += section("Sheet Metal Gallery", "Real sheet metal and factory-strength images.", gallery(assets["sheet"] + capability_images[:2], "Sheet metal fabrication"))
    sheet += cta_band("Request Sheet Metal Quote")
    write("sheet-metal-fabrication/index.html", page_shell("Sheet Metal Fabrication China | CHIKA Manufacturing", "Laser cutting, bending, stamping, welding and powder coating in Dongguan, China.", "Sheet Metal", logo, sheet, depth=1))

    equipment = hero(
        "Factory Strength",
        "Machine images and equipment tables are consolidated here for buyer supplier screening.",
        capability_images[2],
        "Send Factory Capability RFQ",
        "../request-a-quote/index.html",
    )
    equipment += section("CHIKA Equipment Database", "Data-dense supplier proof for sourcing managers and hardware engineers.", equipment_table())
    equipment += section("Machine & Lab Images", "Real equipment and lab proof from the prepared image folders.", gallery([hero_img] + capability_images + quality_images + assets["sheet"], "CHIKA equipment"))
    equipment += cta_band("Send Equipment RFQ")
    write("equipment/index.html", page_shell("CHIKA Equipment List | Injection Molding CNC EDM CMM", "Equipment list for CHIKA injection molding, tooling, sheet metal and quality lab in China.", "Factory Strength", logo, equipment, depth=1))
    write("factory-strength/index.html", page_shell("Factory Strength | CHIKA Manufacturing Equipment", "Factory strength page with CHIKA machine images, injection molding, tooling, sheet metal and quality lab equipment.", "Factory Strength", logo, equipment, depth=1))

    quality = hero(
        "Quality Control & Inspection Lab",
        "IQC, IPQC, FQC, dimensional inspection, RoHS checks, reliability testing and inspection reporting for overseas manufacturing programs.",
        assets["qualityHero"][0],
        "Send Quality Requirements",
        "../request-a-quote/index.html",
    )
    quality += section("Quality Process", "Quality confidence for US buyers is built through inspection checkpoints, not slogans.", value_strips(["Incoming Quality Control", "In-process Quality Control", "Final Quality Control", "Dimensional Inspection", "RoHS Testing", "Reliability Testing", "Appearance Inspection", "Functional Testing"]))
    quality += section("Lab Equipment", "Inspection equipment supports material, dimensional and reliability verification.", equipment_table(["quality"]))
    quality += section("Quality Lab Gallery", "Real lab and inspection equipment photos.", gallery([assets["qualityHero"][0]] + quality_images, "Quality control lab"))
    quality += cta_band("Send Quality Requirements")
    write("quality-control/index.html", page_shell("Quality Control China | Hexagon CMM Nikon 2.5D RoHS", "Quality control with CMM, Nikon 2.5D, RoHS, IQC, IPQC and FQC for US buyers.", "Quality", logo, quality, depth=1))

    quote = text_hero(
        "Request a Quote",
        "Upload drawings securely for Free DFM review, NDA-protected project evaluation and manufacturing feedback within the RFQ process.",
        "Submit RFQ",
    )
    quote += rfq_panel()
    write("request-a-quote/index.html", page_shell("Request a Quote | Free DFM Review | CHIKA Manufacturing", "Upload CAD drawings for a Free DFM review and RFQ from CHIKA Manufacturing in Dongguan, China.", "RFQ", logo, quote, depth=1))

    shuffled_products = product_display_images[::2] + product_display_images[1::2]
    products = hero("Product Display", "Showroom first, product displays in a mixed order, and customer references at the end.", assets["showroom"][0], "Request Product RFQ", "../request-a-quote/index.html")
    products += section("Showroom", "The showroom image is placed first as the product-display entrance.", gallery(assets["showroom"], "CHIKA showroom"))
    products += section("Product Display Gallery", "Prepared product display images are intentionally mixed instead of grouped by original order.", gallery(shuffled_products, "CHIKA product display"))
    products += section("Customer References", "Customer reference images are placed at the end. Public logo use should be approved before launch.", gallery(assets["cases"], "CHIKA customer reference"))
    products += cta_band("Request Product RFQ")
    write("products/index.html", page_shell("Product Display | CHIKA Manufacturing", "Product display gallery for CHIKA injection molding and integrated manufacturing programs.", "Products", logo, products, depth=1))

    CURRENT_DEPTH = 0
    cert = hero("Certifications & Patents", "ISO systems, innovation qualifications, patents and software copyrights from CHIKA source materials.", assets["certificate"][0], "Request Supplier Qualification", "request-a-quote/index.html")
    cert += section("Supplier Qualification Snapshot", "Compliance and innovation proof for supplier screening.", stat_grid([("ISO9001", "Quality management"), ("ISO14001", "Environmental management"), ("ISO45001", "Health and safety"), ("124+", "Patents"), ("9", "Invention patents"), ("111", "Utility model patents"), ("4", "Design patents"), ("33", "Software copyrights")]))
    cert += section("Certificate Image", "Prepared certificate image for public qualification display.", gallery(assets["certificate"], "CHIKA certificate"))
    write("certifications-patents.html", page_shell("Certifications & Patents | CHIKA Manufacturing", "ISO certifications, patents and innovation qualifications for CHIKA Manufacturing.", "Home", logo, cert, depth=0))


def main() -> None:
    clean_site_outputs()
    clean_dir(ASSET_ROOT)
    logo = single_image("chika LOGO.png", "brand", "chika-logo.png")
    hero = [single_image("首页展示注塑机器.jpg", "factory", "hero-injection-machine.jpg")]
    sheet = [single_image("钣金生产车间首页图.png", "factory", "sheet-metal-workshop-cover.png")]
    campus = [single_image("自建厂房展示.png", "factory", "self-owned-facility.png")]
    showroom = [single_image("展厅.png", "products", "showroom.png")]
    certificate = [single_image("证书.png", "certificates", "certificate.png")]
    quality_hero = [single_image("检测室首页图.jpg", "testing", "quality-lab-cover.jpg")]
    products = folder_images("产品展示", "products", "product")
    cases = folder_images("合作客户（放产品展示最后）", "products", "customer-reference")
    metal_capability = image_from_folder("工厂实力(五金加工,注塑加工,模具开发)", "五金加工.png", "factory", "factory-metal-processing.png")
    mold_capability = image_from_folder("工厂实力(五金加工,注塑加工,模具开发)", "模具开发.png", "factory", "factory-mold-development.png")
    injection_capability_1 = image_from_folder("工厂实力(五金加工,注塑加工,模具开发)", "注塑加工1.png", "factory", "factory-injection-molding-1.png")
    injection_capability_2 = image_from_folder("工厂实力(五金加工,注塑加工,模具开发)", "注塑加工2.png", "factory", "factory-injection-molding-2.png")
    capabilities = [metal_capability, mold_capability, injection_capability_1, injection_capability_2]
    quality = folder_images("检测室（质量体系 品质保证）", "testing", "quality")
    if not products or not capabilities or not quality:
        raise RuntimeError("Required prepared image folders are missing or empty.")
    assets = {
        "hero": hero,
        "sheet": sheet,
        "campus": campus,
        "showroom": showroom,
        "certificate": certificate,
        "qualityHero": quality_hero,
        "products": products + showroom,
        "productDisplay": products,
        "cases": cases,
        "capabilities": capabilities,
        "mold": [mold_capability],
        "factory": hero + campus + sheet + capabilities + quality_hero,
        "quality": quality,
    }
    create_nda_pdf()
    build_pages(assets, logo)
    print("Generated CHIKA US B2B manufacturing site")
    for key, value in assets.items():
        print(f"{key}: {len(value)} images")


if __name__ == "__main__":
    main()
