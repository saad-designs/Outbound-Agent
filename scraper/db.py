import os
import re
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pathlib import Path

# Load environment from scraper/.env, web/.env.local, and root .env
env_paths = [
    Path(__file__).resolve().parent / ".env",
    Path(__file__).resolve().parent.parent / "web" / ".env.local",
    Path(__file__).resolve().parent.parent / ".env",
]
for ep in env_paths:
    if ep.exists():
        load_dotenv(ep, override=False)


def get_db_connection():
    """
    Connect to PostgreSQL database with intelligent IPv4/IPv6 and pooler fallback.
    Supports Supabase direct connection and AWS pooler connection.
    """
    urls_to_try = []

    # 1. DATABASE_URL from environment (clean any query params like ?sslmode=require)
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        urls_to_try.append(db_url.split("?")[0])

    # 2. DIRECT_DATABASE_URL from environment
    direct_url = os.environ.get("DIRECT_DATABASE_URL")
    if direct_url:
        urls_to_try.append(direct_url.split("?")[0])

        # If it's a Supabase direct URL, also synthesize the IPv4 pooler URL
        match = re.search(r"://([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?/(.+)", direct_url)
        if match:
            user, password, project_ref, dbname = match.groups()
            pooler_url = f"postgresql://postgres.{project_ref}:{password}@aws-0-ap-southeast-2.pooler.supabase.com:6543/{dbname}"
            if pooler_url not in urls_to_try:
                urls_to_try.append(pooler_url)


    last_error = None
    for url in urls_to_try:
        try:
            conn = psycopg2.connect(url, sslmode="require", connect_timeout=5)
            conn.autocommit = True
            return conn
        except Exception as e:
            last_error = e
            continue

    print(f"[!] Warning: Could not connect to PostgreSQL: {last_error}")
    return None


def insert_or_update_lead(lead_dict: dict) -> bool:
    """Insert or update a lead record in the Supabase PostgreSQL `leads` table."""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        with conn.cursor() as cur:
            # Check if director_angle_id is a valid UUID
            angle_id = lead_dict.get("director_angle_id")
            if angle_id:
                uuid_pattern = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                if not re.match(uuid_pattern, str(angle_id).lower()):
                    angle_id = None

            # Prepare JSON columns
            pain_points = json.dumps(lead_dict.get("pain_points") or [])
            client_brief = json.dumps(lead_dict.get("client_brief") or {})
            call_battlecard = json.dumps(lead_dict.get("call_battlecard") or {})

            sql = """
            INSERT INTO leads (
                business_name, contact_name, niche, city, email, phone,
                has_website, website_url, target_type, website_score,
                website_screenshot_url, audit_slug, rating, review_count,
                top_competitor, pain_points, client_brief, email_subject,
                email_draft_plain, email_draft_html, follow_up_draft,
                call_battlecard, director_angle_id, status
            ) VALUES (
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s
            )
            ON CONFLICT (audit_slug) DO UPDATE SET
                business_name = EXCLUDED.business_name,
                contact_name = COALESCE(EXCLUDED.contact_name, leads.contact_name),
                niche = EXCLUDED.niche,
                city = EXCLUDED.city,
                email = COALESCE(EXCLUDED.email, leads.email),
                phone = COALESCE(EXCLUDED.phone, leads.phone),
                has_website = EXCLUDED.has_website,
                website_url = EXCLUDED.website_url,
                target_type = EXCLUDED.target_type,
                website_score = EXCLUDED.website_score,
                website_screenshot_url = COALESCE(EXCLUDED.website_screenshot_url, leads.website_screenshot_url),
                rating = EXCLUDED.rating,
                review_count = EXCLUDED.review_count,
                top_competitor = EXCLUDED.top_competitor,
                pain_points = EXCLUDED.pain_points,
                client_brief = EXCLUDED.client_brief,
                email_subject = EXCLUDED.email_subject,
                email_draft_plain = EXCLUDED.email_draft_plain,
                email_draft_html = EXCLUDED.email_draft_html,
                follow_up_draft = EXCLUDED.follow_up_draft,
                call_battlecard = EXCLUDED.call_battlecard,
                director_angle_id = COALESCE(EXCLUDED.director_angle_id, leads.director_angle_id),
                status = EXCLUDED.status;
            """

            cur.execute(sql, (
                lead_dict.get("business_name"),
                lead_dict.get("contact_name"),
                lead_dict.get("niche", "Commercial Service"),
                lead_dict.get("city", "Austin, TX"),
                lead_dict.get("email"),
                lead_dict.get("phone"),
                bool(lead_dict.get("has_website")),
                lead_dict.get("website_url"),
                lead_dict.get("target_type", "no_website"),
                lead_dict.get("website_score"),
                lead_dict.get("website_screenshot_url"),
                lead_dict.get("audit_slug"),
                lead_dict.get("rating"),
                lead_dict.get("review_count"),
                lead_dict.get("top_competitor"),
                pain_points,
                client_brief,
                lead_dict.get("email_subject"),
                lead_dict.get("email_draft_plain"),
                lead_dict.get("email_draft_html"),
                lead_dict.get("follow_up_draft"),
                call_battlecard,
                angle_id,
                lead_dict.get("status", "pending_approval")
            ))
            return True
    except Exception as e:
        print(f"[!] PostgreSQL lead insert error: {e}")
        return False
    finally:
        conn.close()


def get_active_playbooks_from_db():
    """Fetch all active strategies from PostgreSQL table `director_playbook`."""
    conn = get_db_connection()
    if not conn:
        return []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, strategy_name, source_type, source_url, extracted_rules,
                       emails_sent, replies_received, hot_leads_generated,
                       conversion_score, is_active, created_at
                FROM director_playbook
                WHERE is_active = true
                ORDER BY conversion_score DESC;
            """)
            rows = cur.fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        print(f"[!] PostgreSQL playbook query error: {e}")
        return []
    finally:
        conn.close()


def insert_playbook_strategy_to_db(strategy_dict: dict) -> str | None:
    """Insert a new strategy into `director_playbook` in PostgreSQL."""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        with conn.cursor() as cur:
            rules_json = json.dumps(strategy_dict.get("extracted_rules") or [])
            cur.execute("""
                INSERT INTO director_playbook (
                    source_type, source_url, strategy_name, extracted_rules,
                    emails_sent, replies_received, hot_leads_generated,
                    conversion_score, is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
            """, (
                strategy_dict.get("source_type", "youtube_transcript"),
                strategy_dict.get("source_url"),
                strategy_dict.get("strategy_name", "AI Extracted Strategy"),
                rules_json,
                strategy_dict.get("emails_sent", 0),
                strategy_dict.get("replies_received", 0),
                strategy_dict.get("hot_leads_generated", 0),
                strategy_dict.get("conversion_score", 0.0),
                strategy_dict.get("is_active", True)
            ))
            row = cur.fetchone()
            return str(row[0]) if row else None
    except Exception as e:
        print(f"[!] PostgreSQL playbook insert error: {e}")
        return None
    finally:
        conn.close()
