"""
MODULE 4: THE BYSAAD COPYWRITER & BRAND GUARDRAIL ENGINE
Generates forensic outreach packages adhering strictly to Saad Bin Faisal's
locked brand rules, banned phrase filters, and dark HTML email templates.
"""

import os
import re
import json
from google import genai
from google.genai import types
from brand_rules import (
    PRIMARY_NAME,
    SECONDARY_BRAND,
    DOMAIN,
    CONTACT_EMAIL,
    CORE_SERVICES,
    BANNED_PHRASES,
    VOICE_RULES
)


def render_bysaad_html_email(email_subject: str, email_draft_plain: str, audit_slug: str) -> str:
    """
    Wrap approved copy into the locked BYSAAD dark HTML email template.
    Strictly follows:
    - #0C0C0C outer background
    - #111111 inner container card
    - 1px solid #1A1A1A border
    - 0px border-radius
    - 1.5px solid #C8F135 accent divider line
    - Oswald all-caps headings and DM Sans body typography
    - Single #C8F135 primary CTA button ('VIEW LIVE AUDIT →')
    """
    paragraphs = [p.strip() for p in email_draft_plain.split("\n\n") if p.strip()]

    # Filter out signature from plain text paragraphs since HTML template has dedicated signature block
    body_paragraphs = []
    for p in paragraphs:
        if PRIMARY_NAME in p or SECONDARY_BRAND in p or DOMAIN in p:
            continue
        body_paragraphs.append(p)

    formatted_body_html = "".join([
        f'<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.75; color: #F2F2F2; font-family: \'DM Sans\', Arial, sans-serif;">{p.replace(chr(10), "<br/>")}</p>'
        for p in body_paragraphs
    ])

    audit_url = f"https://{DOMAIN}/audit/{audit_slug}"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{email_subject}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #0C0C0C; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F2F2F2; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #1A1A1A; border-collapse: separate; border-radius: 0px;">
    <!-- Top Brand Header Bar -->
    <tr>
      <td style="padding: 28px 32px 20px 32px; border-bottom: 1.5px solid #C8F135;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left" style="vertical-align: middle;">
              <span style="font-family: 'Oswald', Arial, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; font-size: 18px; color: #F2F2F2; display: inline-block;">
                {SECONDARY_BRAND}
              </span>
              <span style="font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #3A3A3A; margin-left: 10px; font-family: 'DM Sans', Arial, sans-serif;">
                CONFIDENTIAL AUDIT
              </span>
            </td>
            <td align="right" style="vertical-align: middle;">
              <span style="font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #888888; font-family: 'DM Sans', Arial, sans-serif;">
                // OUTBOUND ENGINE
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Copy -->
    <tr>
      <td style="padding: 32px 32px 24px 32px;">
        {formatted_body_html}

        <!-- Single #C8F135 Primary CTA Block -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 24px 0;">
          <tr>
            <td align="left">
              <a href="{audit_url}" target="_blank" style="display: inline-block; background-color: #C8F135; color: #0C0C0C; font-family: 'Oswald', Arial, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 13px; padding: 14px 28px; text-decoration: none; border-radius: 0px;">
                VIEW LIVE AUDIT &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding-top: 8px;">
              <span style="font-size: 11px; color: #888888; font-family: 'DM Sans', Arial, sans-serif;">
                Interactive prototype & teardown: <span style="color: #F2F2F2;">{audit_url}</span>
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Signature Block -->
    <tr>
      <td style="padding: 24px 32px; border-top: 1px solid #1A1A1A; background-color: #0C0C0C;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left" style="vertical-align: middle;">
              <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #F2F2F2;">
                {PRIMARY_NAME}
              </p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #888888; font-family: 'DM Sans', Arial, sans-serif;">
                {SECONDARY_BRAND} &bull; <a href="https://{DOMAIN}" style="color: #888888; text-decoration: none;">{DOMAIN}</a>
              </p>
            </td>
            <td align="right" style="vertical-align: middle;">
              <span style="font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #3A3A3A; font-family: 'DM Sans', Arial, sans-serif;">
                LAHORE &bull; GLOBAL CLIENTELE
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
    return html


def enforce_brand_guardrails(package: dict, gemini_client=None) -> dict:
    """
    Programmatically scan all copy fields against BANNED_PHRASES.
    Strips or rewrites any offending corporate buzzwords.
    Ensures exact signature lock.
    """
    cleaned_package = dict(package)

    def scrub_text(text: str) -> str:
        if not text:
            return ""
        result = text
        for phrase in BANNED_PHRASES:
            # Case-insensitive replacement
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            result = pattern.sub("", result)
        # Clean up any double spaces created by removal
        result = re.sub(r" +", " ", result)
        return result.strip()

    # Scrub subject
    if "email_subject" in cleaned_package:
        cleaned_package["email_subject"] = scrub_text(cleaned_package["email_subject"])

    # Scrub plain text
    if "email_draft_plain" in cleaned_package:
        plain = scrub_text(cleaned_package["email_draft_plain"])
        # Ensure locked signature ending
        required_sig = f"{PRIMARY_NAME}\n{SECONDARY_BRAND} · {DOMAIN}"
        if required_sig not in plain:
            # Remove any trailing name/domain fragments
            lines = [l for l in plain.split("\n") if PRIMARY_NAME not in l and SECONDARY_BRAND not in l and DOMAIN not in l]
            plain = "\n".join(lines).strip() + f"\n\n{required_sig}"
        cleaned_package["email_draft_plain"] = plain

    # Scrub follow-up
    if "follow_up_draft" in cleaned_package:
        cleaned_package["follow_up_draft"] = scrub_text(cleaned_package["follow_up_draft"])

    # Scrub client brief
    if "client_brief" in cleaned_package and isinstance(cleaned_package["client_brief"], dict):
        brief = cleaned_package["client_brief"]
        brief["business_summary"] = scrub_text(brief.get("business_summary", ""))
        brief["working_model"] = scrub_text(brief.get("working_model", ""))
        brief["pitch_angle"] = scrub_text(brief.get("pitch_angle", ""))

        # Filter recommended services strictly against CORE_SERVICES
        valid_services = []
        for s in brief.get("recommended_services", []):
            match = next((cs for cs in CORE_SERVICES if cs.lower() in s.lower() or s.lower() in cs.lower()), None)
            if match and match not in valid_services:
                valid_services.append(match)
        if not valid_services:
            valid_services = CORE_SERVICES[:3]
        brief["recommended_services"] = valid_services

    # Re-render HTML email with cleaned copy
    cleaned_package["email_draft_html"] = render_bysaad_html_email(
        cleaned_package.get("email_subject", "Teardown"),
        cleaned_package.get("email_draft_plain", ""),
        cleaned_package.get("audit_slug", "preview")
    )

    return cleaned_package


def generate_outreach_package(lead_data: dict, director_angle: dict, gemini_client) -> dict:
    """
    Generate complete forensic outreach package:
    - pain_points (3-4 items)
    - client_brief (business_summary, working_model, pitch_angle, recommended_services)
    - email_subject
    - email_draft_plain
    - follow_up_draft
    - call_battlecard (hook, problem, soft_close)
    """
    business_name = lead_data.get("business_name", "Target Business")
    contact_name = lead_data.get("contact_name") or "Owner"
    niche = lead_data.get("niche", "Local Services")
    city = lead_data.get("city", "")
    target_type = lead_data.get("target_type", "no_website")
    top_competitor = lead_data.get("top_competitor", "Top Local Competitor")
    rating = lead_data.get("rating", 4.9)
    review_count = lead_data.get("review_count", 50)
    audit_slug = lead_data.get("audit_slug") or f"{re.sub(r'[^a-zA-Z0-9]+', '-', business_name).lower()}-{city.lower()}"
    flaws = lead_data.get("visual_and_ux_flaws", [])

    system_instruction = (
        f"You are the Lead Outbound Copywriter for {PRIMARY_NAME} ({SECONDARY_BRAND}). "
        f"Brand voice rules: {VOICE_RULES} "
        f"You MUST NEVER use any of these banned phrases: {', '.join(BANNED_PHRASES)}. "
        f"Core services you pitch: {json.dumps(CORE_SERVICES)}. "
        "Write direct, confident, human, and outcome-led cold outreach. "
        "Lead with what the client gets. Avoid marketing fluff or generic compliments. "
        "Output ONLY valid JSON matching the requested schema."
    )

    prompt = f"""
TARGET LEAD DOSSIER:
- Business: {business_name}
- Contact: {contact_name}
- Niche: {niche} in {city}
- Target Type: {target_type} ({'Has no website' if target_type == 'no_website' else 'Has an outdated/crappy website'})
- Google Reviews: {review_count} reviews ({rating}★)
- Top Competitor Stealing Local Traffic: {top_competitor}
- Audit Slug: {audit_slug}
- Website / Visual Flaws Identified: {json.dumps(flaws)}

DIRECTOR STRATEGY ANGLE:
- Strategy Name: {director_angle.get('strategy_name')}
- Hook Formula: {director_angle.get('hook_formula')}
- Pain Point Framing: {director_angle.get('pain_point_framing')}
- CTA Mechanic: {director_angle.get('cta_mechanic')}

Generate a forensic outreach package as JSON matching this schema:
{{
  "pain_points": [
    "<3 to 4 specific, quantified operational and website flaws, e.g. losing 15-20 commercial quotes/mo to named competitor, unverified phone redirects, mobile lag>"
  ],
  "client_brief": {{
    "business_summary": "<1-2 sentences summarizing their business, reputation, and operational scale>",
    "working_model": "<high-ticket job sizes or appointment economics in their niche>",
    "pitch_angle": "<exact commercial reason they need a BYSAAD web conversion system>",
    "recommended_services": ["<select 2 to 3 services strictly from: {', '.join(CORE_SERVICES)}>"]
  }},
  "email_subject": "<lowercase, direct, specific subject line without clickbait, e.g. {business_name.lower()} — 18 lost commercial quotes in {city.lower()}>",
  "email_draft_plain": "<Direct, confident cold email. 80-140 words. Reference specific review count and competitor gap or website flaw. Include audit link: https://{DOMAIN}/audit/{audit_slug}. End with exact lines:\\n{PRIMARY_NAME}\\n{SECONDARY_BRAND} · {DOMAIN}>",
  "follow_up_draft": "<Two-sentence Day-3 follow-up bump referencing the audit link>",
  "call_battlecard": {{
    "hook": "<Disarming 7-second phone opening>",
    "problem": "<The core operational bleed / competitor gap>",
    "soft_close": "<Low-friction close to email the interactive audit preview>"
  }}
}}
"""

    package = None

    if gemini_client:
        try:
            model_name = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    system_instruction=system_instruction,
                    temperature=0.35,
                )
            )
            package = json.loads(response.text.strip())
        except Exception as e:
            print(f"[!] Copywriter Gemini generation error: {e}")

    # Fallback template if Gemini was not available or errored
    if not package:
        if target_type == "no_website":
            package = {
                "pain_points": [
                    f"Zero verified digital domain or web property attached to Google listing with {review_count} five-star reviews.",
                    f"Losing high-ticket {niche.lower()} quote requests directly to {top_competitor}.",
                    "Google profile redirects prospective clients to an unverified phone line without automated lead capture."
                ],
                "client_brief": {
                    "business_summary": f"Top-rated {niche.lower()} contractor in {city} with strong review reputation but zero digital infrastructure.",
                    "working_model": f"High-margin {niche.lower()} contracts requiring upfront portfolio trust and rapid quote intake.",
                    "pitch_angle": f"Capture commercial and residential searchers who bounce to {top_competitor}.",
                    "recommended_services": [
                        "Full website build in Wix Studio",
                        "Multi-step intake forms & lead-capture systems",
                        "On-page SEO setup"
                    ]
                },
                "email_subject": f"{business_name.lower()} — 15 lost quotes in {city.lower()}",
                "email_draft_plain": f"""{contact_name},

You have {review_count} five-star reviews on Google in {city}, but no website attached to your profile.

{top_competitor} is currently taking the top search terms because they offer an instant online bid request form. Commercial property managers and homeowners searching for {niche.lower()} bounce when they can't verify past work or submit specs after hours.

We build high-performance web systems in Wix Studio designed to capture inquiries and qualify budgets before you dispatch a truck.

Built a live preview of how {business_name}'s intake portal would look:
https://{DOMAIN}/audit/{audit_slug}

Worth a 5-minute review?

{PRIMARY_NAME}
{SECONDARY_BRAND} · {DOMAIN}""",
                "follow_up_draft": f"{contact_name} — following up on the {business_name} intake setup. Did you check https://{DOMAIN}/audit/{audit_slug}?",
                "call_battlecard": {
                    "hook": f"Hey {contact_name}, Saad here with BYSAAD. Not a pitch call — noticed your Google profile has {review_count} reviews in {city} but zero website linked.",
                    "problem": f"Right now {top_competitor} is intercepting people who look for a quote intake form after hours.",
                    "soft_close": f"I built a 1-page interactive preview of what your quote intake could look like. Can I shoot that over to your direct email?"
                }
            }
        else:
            package = {
                "pain_points": [
                    "Mobile load time exceeds 4.5 seconds with uncompressed imagery.",
                    f"Broken or insecure appointment intake causing patient drop-off to {top_competitor}.",
                    "Outdated layout lacking mobile responsiveness and clear trust badges."
                ],
                "client_brief": {
                    "business_summary": f"Established {niche.lower()} practice in {city} with {review_count} Google reviews but degraded web conversion.",
                    "working_model": f"High-margin elective and service procedures reliant on immediate mobile trust.",
                    "pitch_angle": f"Plug the mobile conversion leak currently forfeiting high-value bookings to {top_competitor}.",
                    "recommended_services": [
                        "Full website build in Wix Studio",
                        "Multi-step intake forms & lead-capture systems",
                        "Complete site copywriting"
                    ]
                },
                "email_subject": f"{business_name.lower()} — broken mobile intake on {city.lower()} search",
                "email_draft_plain": f"""{contact_name},

Looked up your practice after seeing your {review_count} Google reviews in {city}.

Your site takes nearly 5 seconds to load on mobile, and the contact flow has security warnings. High-value clients bounce to {top_competitor} within seconds.

I rebuilt your mobile booking flow and intake portal in an ultra-fast architecture.

Here is the teardown and working prototype:
https://{DOMAIN}/audit/{audit_slug}

Can I send over the 2-minute walkthrough?

{PRIMARY_NAME}
{SECONDARY_BRAND} · {DOMAIN}""",
                "follow_up_draft": f"{contact_name} — wanted to ensure you saw the teardown for {business_name} at https://{DOMAIN}/audit/{audit_slug}.",
                "call_battlecard": {
                    "hook": f"{contact_name}, Saad here from BYSAAD. Calling because your Google listing has {review_count} reviews but your mobile booking form is broken.",
                    "problem": f"Searchers in {city} are bouncing straight to {top_competitor}.",
                    "soft_close": "We mapped out the drop-off points in a live prototype. Open to taking a look today?"
                }
            }

    package["audit_slug"] = audit_slug
    # Apply brand guardrails (strip banned phrases, enforce signature, render HTML email)
    guarded_package = enforce_brand_guardrails(package, gemini_client)
    return guarded_package
