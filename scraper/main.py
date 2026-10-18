"""
MODULE 5: BYSAAD OUTBOUND ENGINE ORCHESTRATOR & CLI
Modular Python CLI wiring Google Maps scraper, Playwright Website Auditor,
Self-Learning YouTube Director, and BYSAAD Copywriter.
"""

import os
import sys
import json
import asyncio
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env if present
env_paths = [
    Path(__file__).resolve().parent / ".env",
    Path(__file__).resolve().parent.parent / ".env",
]
for ep in env_paths:
    if ep.exists():
        load_dotenv(ep)
        break

from google import genai
from website_auditor import audit_website
from maps_scraper import scrape_google_maps
from director import ingest_youtube_strategy, select_best_director_angle
from copywriter import generate_outreach_package, render_bysaad_html_email
from brand_rules import PRIMARY_NAME, SECONDARY_BRAND, DOMAIN


def get_gemini_client():
    """Initialize official google-genai client."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[!] Warning: GEMINI_API_KEY not found in environment. Running with deterministic fallbacks.")
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"[!] Warning: Could not initialize google-genai client: {e}")
        return None


def get_supabase_client():
    """Initialize Supabase client if credentials are configured."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception as e:
        print(f"[!] Warning: Could not initialize Supabase client: {e}")
        return None


async def run_single_audit(url: str, name: str, gemini_client, supabase_client, dry_run: bool):
    """Run an instant audit and outreach generation for a single website."""
    from playwright.async_api import async_playwright
    print(f"[*] Starting instant audit for: {name} ({url})")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            audit_result = await audit_website(page, url, gemini_client)
        finally:
            await browser.close()

    lead_data = {
        "business_name": name,
        "niche": "Local Service",
        "city": "Unknown",
        "email": audit_result.get("primary_email"),
        "phone": None,
        "has_website": True,
        "website_url": url,
        "target_type": "crappy_website" if audit_result.get("is_crappy") else "no_website",
        "website_score": audit_result.get("website_score"),
        "website_screenshot_url": audit_result.get("website_screenshot_url"),
        "audit_slug": audit_result.get("slug"),
        "rating": 4.8,
        "review_count": 45,
        "top_competitor": "Category Leader",
        "visual_and_ux_flaws": audit_result.get("visual_and_ux_flaws", [])
    }

    angle = select_best_director_angle(lead_data, supabase_client)
    outreach = generate_outreach_package(lead_data, angle, gemini_client)
    full_lead = {**lead_data, **outreach, "status": "pending_approval", "director_angle_id": angle.get("id")}

    if not dry_run:
        try:
            from db import insert_or_update_lead
            if insert_or_update_lead(full_lead):
                print(f"[+] Successfully saved lead to PostgreSQL: {full_lead['business_name']}")
        except Exception as pg_err:
            print(f"[!] PostgreSQL insert notice: {pg_err}")

        if supabase_client:
            try:
                supabase_client.table("leads").insert(full_lead).execute()
                print(f"[+] Successfully inserted into Supabase `leads`: {full_lead['business_name']}")
            except Exception as db_err:
                print(f"[!] Supabase insert notice: {db_err}")

    output_path = Path(__file__).resolve().parent / "dry_run_output.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump([full_lead], f, indent=2)

    print("\n" + "=" * 60)
    print(f"AUDIT COMPLETE: {name}")
    print(f"Score: {audit_result.get('website_score')}/100 | Is Crappy: {audit_result.get('is_crappy')}")
    print(f"Screenshot: {audit_result.get('website_screenshot_url')}")
    print(f"Subject: {full_lead.get('email_subject')}")
    print("=" * 60)
    print(full_lead.get("email_draft_plain"))
    print("=" * 60)
    print(f"[*] Saved output to: {output_path}")


async def run_scrape_pipeline(niche: str, city: str, limit: int, gemini_client, supabase_client, dry_run: bool):
    """Scrape Google Maps, audit leads, generate personalized outreach packages."""
    print(f"[*] Starting Dual-Target Pipeline: {niche} in {city} (Max: {limit})")

    scraped_leads = await scrape_google_maps(
        niche=niche,
        city=city,
        max_leads=limit,
        gemini_client=gemini_client
    )

    processed_leads = []

    for idx, lead in enumerate(scraped_leads, 1):
        print(f"\n[{idx}/{len(scraped_leads)}] Synthesizing BYSAAD Package for: {lead['business_name']} ({lead['target_type']})")
        angle = select_best_director_angle(lead, supabase_client)
        outreach = generate_outreach_package(lead, angle, gemini_client)

        full_lead = {
            "business_name": lead.get("business_name"),
            "contact_name": lead.get("contact_name"),
            "niche": lead.get("niche"),
            "city": lead.get("city"),
            "email": lead.get("email"),
            "phone": lead.get("phone"),
            "has_website": lead.get("has_website", False),
            "website_url": lead.get("website_url"),
            "target_type": lead.get("target_type"),
            "website_score": lead.get("website_score"),
            "website_screenshot_url": lead.get("website_screenshot_url"),
            "audit_slug": lead.get("audit_slug"),
            "rating": lead.get("rating"),
            "review_count": lead.get("review_count"),
            "top_competitor": lead.get("top_competitor"),
            "pain_points": outreach.get("pain_points", []),
            "client_brief": outreach.get("client_brief", {}),
            "email_subject": outreach.get("email_subject"),
            "email_draft_plain": outreach.get("email_draft_plain"),
            "email_draft_html": outreach.get("email_draft_html"),
            "follow_up_draft": outreach.get("follow_up_draft"),
            "call_battlecard": outreach.get("call_battlecard"),
            "director_angle_id": angle.get("id"),
            "status": "pending_approval"
        }

        # Save to PostgreSQL and Supabase if live and not dry-run
        if not dry_run:
            try:
                from db import insert_or_update_lead
                if insert_or_update_lead(full_lead):
                    print(f"    [+] Successfully saved lead to PostgreSQL: {full_lead['business_name']}")
            except Exception as pg_err:
                print(f"    [!] PostgreSQL insert notice: {pg_err}")

            if supabase_client:
                try:
                    res = supabase_client.table("leads").insert(full_lead).execute()
                    print(f"    [+] Successfully inserted into Supabase `leads`: {full_lead['business_name']}")
                except Exception as db_err:
                    print(f"    [!] Supabase insert error: {db_err}")

        processed_leads.append(full_lead)

    output_path = Path(__file__).resolve().parent / "dry_run_output.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(processed_leads, f, indent=2)

    print("\n" + "=" * 60)
    print(f"PIPELINE COMPLETE: {len(processed_leads)} LEADS PROCESSED")
    print(f"Output saved to: {output_path}")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description=f"BYSAAD Outbound Engine CLI — {PRIMARY_NAME} ({SECONDARY_BRAND})"
    )
    parser.add_argument("--scrape", action="store_true", help="Run dual-target Google Maps scraper and auditor")
    parser.add_argument("--niche", type=str, default="Commercial Roofing", help="Target business niche")
    parser.add_argument("--city", type=str, default="Austin, TX", help="Target city")
    parser.add_argument("--limit", type=int, default=3, help="Max leads to audit")
    parser.add_argument("--learn-youtube", type=str, help="Ingest a YouTube video transcript into Director Playbook")
    parser.add_argument("--audit-url", type=str, help="Run an instant audit on a single website URL")
    parser.add_argument("--name", type=str, default="Target Business", help="Business name for single audit")
    parser.add_argument("--dry-run", action="store_true", help="Save leads to dry_run_output.json without writing to Supabase")

    args = parser.parse_args()

    gemini_client = get_gemini_client()
    supabase_client = get_supabase_client()

    if args.learn_youtube:
        print(f"[*] Ingesting YouTube strategy: {args.learn_youtube}")
        strat = ingest_youtube_strategy(args.learn_youtube, gemini_client, supabase_client)
        print("\n" + "=" * 60)
        print("DIRECTOR STRATEGY INGESTED:")
        print(f"Name: {strat.get('strategy_name')}")
        print(f"Rules: {json.dumps(strat.get('extracted_rules', []), indent=2)}")
        print("=" * 60)
        return

    if args.audit_url:
        asyncio.run(
            run_single_audit(
                url=args.audit_url,
                name=args.name,
                gemini_client=gemini_client,
                supabase_client=supabase_client,
                dry_run=args.dry_run
            )
        )
        return

    if args.scrape:
        asyncio.run(
            run_scrape_pipeline(
                niche=args.niche,
                city=args.city,
                limit=args.limit,
                gemini_client=gemini_client,
                supabase_client=supabase_client,
                dry_run=args.dry_run
            )
        )
        return

    parser.print_help()


if __name__ == "__main__":
    main()
