"""
MODULE 1: WEBSITE TECHNICAL & VISION AUDITOR
Playwright + BeautifulSoup4 + Pillow + google-genai (Gemini 2.5 Flash)
Deterministic DOM checks + multimodal UX scoring and screenshot capture.
"""

import os
import re
import time
import json
from pathlib import Path
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from google import genai
from google.genai import types

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", re.IGNORECASE)

BANNED_EMAIL_SUBSTRINGS = [
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
    "sentry", "wixpress", "example.com", "domain.com", "yourdomain",
    "email@address", "user@", "test@", "schema.org", "w3.org"
]


def clean_emails(raw_emails: list[str]) -> list[str]:
    """Filter and deduplicate email candidates."""
    valid = []
    seen = set()
    for e in raw_emails:
        cleaned = e.strip().lower().rstrip(".,;:)'\"")
        if len(cleaned) < 6 or "@" not in cleaned:
            continue
        if any(b in cleaned for b in BANNED_EMAIL_SUBSTRINGS):
            continue
        if cleaned not in seen:
            seen.add(cleaned)
            valid.append(cleaned)
    return valid


def slugify_url(url: str) -> str:
    """Create a URL-safe slug from a website URL."""
    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", domain).strip("-").lower()
    return slug or "unnamed-site"


async def audit_website(page, url: str, gemini_client=None, slug: str = None) -> dict:
    """
    Audit website via Playwright headless page:
    1. Measure load time & verify SSL
    2. Extract emails (homepage + fallback /contact or /about)
    3. Perform deterministic DOM checks (viewport, lead forms, generator)
    4. Capture 1280x800 PNG screenshot saved to /web/public/audits/{slug}.png
    5. Evaluate via gemini-2.5-flash with visual bytes + DOM telemetry
    """
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    slug = slug or slugify_url(url)
    has_ssl = url.lower().startswith("https://")

    # Set desktop viewport for crisp vision audit
    await page.set_viewport_size({"width": 1280, "height": 800})

    start_time = time.perf_counter()
    load_time_ms = 0
    html_content = ""
    navigation_success = False

    try:
        response = await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        load_time_ms = int((time.perf_counter() - start_time) * 1000)
        # Give JS frameworks 1 second to hydrate
        await page.wait_for_timeout(1000)
        html_content = await page.content()
        navigation_success = True
    except Exception as e:
        # Fallback if https failed: try http if applicable
        if url.startswith("https://"):
            try:
                fallback_url = "http://" + url[8:]
                start_time = time.perf_counter()
                response = await page.goto(fallback_url, wait_until="domcontentloaded", timeout=12000)
                load_time_ms = int((time.perf_counter() - start_time) * 1000)
                await page.wait_for_timeout(800)
                html_content = await page.content()
                navigation_success = True
                has_ssl = False
            except Exception as e2:
                load_time_ms = 15000
        else:
            load_time_ms = 15000

    soup = BeautifulSoup(html_content, "html.parser") if html_content else None

    # 1. Deterministic DOM Checks
    has_viewport_meta = False
    has_lead_capture = False
    generator_footprint = "Unknown / Custom"

    if soup:
        # Viewport check
        viewport = soup.find("meta", attrs={"name": re.compile(r"^viewport$", re.I)})
        has_viewport_meta = bool(viewport and "width" in viewport.get("content", "").lower())

        # Lead capture check
        forms = soup.find_all("form")
        inputs = soup.find_all("input", attrs={"type": lambda t: t in ["text", "email", "tel", None]})
        booking_keywords = ["calendly", "acuity", "book", "schedule", "quote", "intake", "consult"]
        booking_embed = any(
            any(kw in str(tag).lower() for kw in booking_keywords)
            for tag in soup.find_all(["iframe", "script", "div", "button", "a"])
        )
        has_lead_capture = bool((forms and inputs) or booking_embed)

        # Generator check
        gen_meta = soup.find("meta", attrs={"name": re.compile(r"^generator$", re.I)})
        if gen_meta and gen_meta.get("content"):
            generator_footprint = gen_meta["content"]
        else:
            scripts_str = " ".join([s.get("src", "") for s in soup.find_all("script") if s.get("src")])
            if "wp-content" in html_content or "wp-includes" in html_content:
                generator_footprint = "WordPress (Legacy Theme / Plugins detected)"
            elif "wix.com" in scripts_str or "_wix" in html_content:
                generator_footprint = "Wix (Standard)"
            elif "squarespace" in html_content:
                generator_footprint = "Squarespace"
            elif "godaddy" in html_content:
                generator_footprint = "GoDaddy Website Builder"

    # 2. Extract emails from homepage
    found_emails = []
    if soup:
        # mailto: links
        for a in soup.find_all("a", href=True):
            if a["href"].startswith("mailto:"):
                found_emails.append(a["href"].replace("mailto:", "").split("?")[0])
        # regex on visible text & attributes
        found_emails.extend(EMAIL_REGEX.findall(html_content))

    # 3. Fallback: Check /contact or /about if no email found
    cleaned_found_emails = clean_emails(found_emails)
    if not cleaned_found_emails and soup:
        contact_links = []
        for a in soup.find_all("a", href=True):
            href = a["href"].strip().lower()
            if any(term in href for term in ["contact", "about-us", "about"]):
                contact_links.append(urljoin(url, a["href"]))

        if contact_links:
            try:
                target_subpage = contact_links[0]
                await page.goto(target_subpage, wait_until="domcontentloaded", timeout=8000)
                await page.wait_for_timeout(500)
                sub_html = await page.content()
                sub_soup = BeautifulSoup(sub_html, "html.parser")
                for a in sub_soup.find_all("a", href=True):
                    if a["href"].startswith("mailto:"):
                        cleaned_found_emails.append(a["href"].replace("mailto:", "").split("?")[0])
                cleaned_found_emails.extend(EMAIL_REGEX.findall(sub_html))
                cleaned_found_emails = clean_emails(cleaned_found_emails)
            except Exception:
                pass

    # 4. Viewport screenshot capture
    screenshot_bytes = b""
    screenshot_relative_path = f"/audits/{slug}.png"
    # Destination in Next.js public directory
    public_audits_dir = Path(__file__).resolve().parent.parent / "web" / "public" / "audits"
    public_audits_dir.mkdir(parents=True, exist_ok=True)
    screenshot_file_path = public_audits_dir / f"{slug}.png"

    if navigation_success:
        try:
            screenshot_bytes = await page.screenshot(type="png", full_page=False)
            with open(screenshot_file_path, "wb") as f:
                f.write(screenshot_bytes)
        except Exception as e:
            # Create a 1280x800 fallback placeholder image using Pillow if screenshot fails
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (1280, 800), color="#0C0C0C")
            draw = ImageDraw.Draw(img)
            draw.text((40, 40), f"BYSAAD AUDIT SNAPSHOT: {url}", fill="#F2F2F2")
            img.save(screenshot_file_path)
    else:
        # Create empty/offline placeholder
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (1280, 800), color="#0C0C0C")
        draw = ImageDraw.Draw(img)
        draw.text((40, 40), f"SITE UNREACHABLE / TIMEOUT: {url}", fill="#C8F135")
        img.save(screenshot_file_path)

    # 5. Gemini 2.5 Flash Vision & UX Evaluation
    website_score = 45
    is_crappy = True
    visual_and_ux_flaws = [
        "Unresponsive layout lacking fluid mobile breakpoints",
        "Absence of modern high-ticket lead qualification forms",
        "Visual hierarchy lacks trust signals and conversion clarity"
    ]

    if gemini_client and screenshot_bytes:
        system_instruction = (
            "You are the Lead Visual Auditor for BYSAAD, an elite design engineering firm led by Saad Bin Faisal. "
            "You evaluate local service business websites critically. You examine the visual screenshot, "
            "typography, visual hierarchy, mobile readiness, trust signals, and lead capture mechanics. "
            "Be forensic, direct, and unsparing. Return ONLY valid JSON with no markdown wrapping."
        )

        prompt = f"""
Audit this website:
URL: {url}
Load Time: {load_time_ms}ms
Has SSL: {has_ssl}
Has Viewport Meta: {has_viewport_meta}
Has Active Lead Capture Form: {has_lead_capture}
Detected Generator: {generator_footprint}

Analyze the attached screenshot and DOM telemetry. Return a JSON object matching this schema:
{{
  "website_score": <int between 0 and 100 based on modern web design, speed, and conversion>,
  "is_crappy": <bool: true if website_score < 65 or significant conversion flaws exist, else false>,
  "visual_and_ux_flaws": [
    "<3 to 4 specific, actionable flaws observed in typography, layout, CTA placement, or mobile friction>"
  ]
}}
"""
        try:
            model_name = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=[
                    prompt,
                    types.Part.from_bytes(data=screenshot_bytes, mime_type="image/png")
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    system_instruction=system_instruction,
                    temperature=0.2,
                )
            )
            raw_text = response.text.strip()
            data = json.loads(raw_text)
            website_score = int(data.get("website_score", 45))
            is_crappy = bool(data.get("is_crappy", website_score < 65))
            flaws = data.get("visual_and_ux_flaws", [])
            if isinstance(flaws, list) and flaws:
                visual_and_ux_flaws = [str(f) for f in flaws[:4]]
        except Exception as err:
            # Deterministic fallback calculation
            score = 70
            if not has_ssl:
                score -= 25
            if not has_viewport_meta:
                score -= 20
            if not has_lead_capture:
                score -= 20
            if load_time_ms > 4000:
                score -= 15
            website_score = max(15, min(score, 90))
            is_crappy = website_score < 65

    return {
        "url": url,
        "slug": slug,
        "load_time_ms": load_time_ms,
        "has_ssl": has_ssl,
        "has_viewport_meta": has_viewport_meta,
        "has_lead_capture": has_lead_capture,
        "generator_footprint": generator_footprint,
        "emails": cleaned_found_emails,
        "primary_email": cleaned_found_emails[0] if cleaned_found_emails else None,
        "website_score": website_score,
        "is_crappy": is_crappy,
        "visual_and_ux_flaws": visual_and_ux_flaws,
        "website_screenshot_url": screenshot_relative_path,
    }
