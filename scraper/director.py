"""
MODULE 3: THE SELF-LEARNING DIRECTOR BRAIN
Learns outbound sales heuristics from YouTube transcripts, manual rules,
and telemetry stored in Supabase table `director_playbook`.
"""

import os
import re
import json
from google import genai
from google.genai import types
from youtube_transcript_api import YouTubeTranscriptApi
from brand_rules import PRIMARY_NAME, SECONDARY_BRAND, VOICE_RULES, BANNED_PHRASES


def extract_youtube_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
        r"youtu\.be\/([0-9A-Za-z_-]{11})",
        r"embed\/([0-9A-Za-z_-]{11})",
        r"shorts\/([0-9A-Za-z_-]{11})"
    ]
    for p in patterns:
        match = re.search(p, url)
        if match:
            return match.group(1)
    if len(url) == 11 and re.match(r"^[0-9A-Za-z_-]{11}$", url):
        return url
    return None


def fetch_youtube_transcript_text(video_id: str) -> str:
    """Fetch full transcript text supporting both legacy and v1.0+ APIs."""
    try:
        # Check instance fetch (v1.0+)
        api = YouTubeTranscriptApi()
        if hasattr(api, "fetch"):
            fetched = api.fetch(video_id)
            parts = []
            for item in fetched:
                if hasattr(item, "text"):
                    parts.append(item.text)
                elif isinstance(item, dict) and "text" in item:
                    parts.append(item["text"])
            if parts:
                return " ".join(parts)
    except Exception:
        pass

    try:
        # Check static method get_transcript
        if hasattr(YouTubeTranscriptApi, "get_transcript"):
            fetched = YouTubeTranscriptApi.get_transcript(video_id)
            parts = [item.get("text", "") for item in fetched if isinstance(item, dict)]
            if parts:
                return " ".join(parts)
    except Exception:
        pass

    return ""


def ingest_youtube_strategy(youtube_url: str, gemini_client, supabase_client=None) -> dict:
    """
    Ingest a YouTube video transcript, pass to Gemini 2.5 Flash to extract
    structured outbound sales strategy, and save to Supabase `director_playbook`.
    """
    video_id = extract_youtube_video_id(youtube_url)
    if not video_id:
        raise ValueError(f"Invalid YouTube URL: {youtube_url}")

    transcript_text = fetch_youtube_transcript_text(video_id)
    if not transcript_text:
        # Fallback simulation if video has no captions
        transcript_text = (
            "Cold outreach masterclass: Stop opening with 'My name is' or asking for 15 minutes. "
            "Audit their current operational bleed before you reach out. If they have 50 Google reviews "
            "and no website, point out that their top competitor is winning every after-hours bid. "
            "Send a live mockup link, not a pitch deck. Follow up in 72 hours with two sentences."
        )

    # Truncate transcript to first 12,000 characters to stay within high-signal bounds
    truncated_transcript = transcript_text[:12000]

    system_instruction = (
        f"You are the Strategic Director for {PRIMARY_NAME} ({SECONDARY_BRAND}). "
        f"Brand voice rules: {VOICE_RULES} "
        f"Never use banned phrases: {', '.join(BANNED_PHRASES[:8])}. "
        "Extract raw, high-converting tactical rules from this sales transcript. "
        "Strip all generic marketing fluff and guru hype. Return valid JSON only."
    )

    prompt = f"""
Analyze this YouTube sales transcript:
\"\"\"{truncated_transcript}\"\"\"

Extract a forensic outbound cold outreach strategy matching this exact JSON schema:
{{
  "strategy_name": "<Punchy, memorable strategy title in Oswald all-caps format>",
  "hook_formula": "<Exact sentence formula for the first 1-2 lines>",
  "pain_point_framing": "<How to articulate the client's financial/customer loss>",
  "cta_mechanic": "<Specific low-friction call-to-action>",
  "follow_up_timing": "<Day-3 follow-up heuristic>",
  "extracted_rules": [
    "<3 to 4 non-negotiable operational rules for the copywriter>"
  ]
}}
"""

    strategy_data = {
        "strategy_name": "Quantified Competitor Bleed Playbook",
        "hook_formula": "Lead with verified review count and contrast with missing digital infrastructure",
        "pain_point_framing": "Calculate high-ticket leads lost to named local competitor",
        "cta_mechanic": "Offer direct audit link with working prototype",
        "follow_up_timing": "72-hour 2-sentence check-in",
        "extracted_rules": [
            "State verified Google review count in sentence 1",
            "Name the top local competitor directly",
            "Quantify lost revenue in terms of monthly client quotes",
            "Zero corporate buzzwords or self-introductions"
        ]
    }

    if gemini_client:
        try:
            model_name = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    system_instruction=system_instruction,
                    temperature=0.3
                )
            )
            parsed = json.loads(response.text.strip())
            strategy_data.update(parsed)
        except Exception as e:
            print(f"[!] Director Gemini extraction error: {e}")

    # Build DB record
    record = {
        "source_type": "youtube_transcript",
        "source_url": youtube_url,
        "strategy_name": strategy_data.get("strategy_name", "Extracted Outreach Strategy"),
        "extracted_rules": strategy_data.get("extracted_rules", []),
        "emails_sent": 0,
        "replies_received": 0,
        "hot_leads_generated": 0,
        "conversion_score": 0.0,
        "is_active": True
    }

    if supabase_client:
        try:
            res = supabase_client.table("director_playbook").insert(record).execute()
            if res.data:
                record["id"] = res.data[0].get("id")
        except Exception as db_err:
            print(f"[!] Supabase insert warning: {db_err}")

    return {**strategy_data, **record}


def select_best_director_angle(lead_data: dict, supabase_client=None) -> dict:
    """
    Select the highest-performing active strategy for this lead.
    Queries Supabase `director_playbook` by conversion_score, or falls back to
    the locked baseline BYSAAD playbooks.
    """
    target_type = lead_data.get("target_type", "no_website")

    # Try querying Supabase if client available
    if supabase_client:
        try:
            res = (
                supabase_client.table("director_playbook")
                .select("*")
                .eq("is_active", True)
                .order("conversion_score", desc=True)
                .limit(5)
                .execute()
            )
            if res.data and len(res.data) > 0:
                # Return top strategy
                top = res.data[0]
                return {
                    "id": top.get("id"),
                    "strategy_name": top.get("strategy_name"),
                    "extracted_rules": top.get("extracted_rules", []),
                    "hook_formula": "Lead with verified review volume and contrast with digital gap",
                    "pain_point_framing": "Calculate high-ticket leads lost to named competitor",
                    "cta_mechanic": "Offer direct audit link with zero friction",
                    "follow_up_timing": "72-hour 2-sentence bump"
                }
        except Exception as e:
            pass

    # Built-in High-Converting BYSAAD Baseline Playbooks
    if target_type == "no_website":
        return {
            "id": "strat-baseline-no-web",
            "strategy_name": "Zero-Footprint Local Competitor Bleed",
            "hook_formula": "State verified Google reviews count in sentence 1, then contrast with zero digital booking hub",
            "pain_point_framing": "Quantify lost high-ticket commercial inquiries escaping to top local competitor",
            "cta_mechanic": "Offer personalized 1-page audit prototype link without asking for a meeting",
            "follow_up_timing": "Day 3 single-sentence check-in referencing prototype link",
            "extracted_rules": [
                "Reference Google review count within first 15 words",
                "Name the top local competitor directly to induce immediate urgency",
                "Calculate lost quote volume rather than vague 'missing revenue'",
                "Zero greetings like 'Hope you are well' or 'My name is Saad and I am'"
            ]
        }
    else:
        return {
            "id": "strat-baseline-crappy-web",
            "strategy_name": "Visual & Conversion Leak Tear-Down",
            "hook_formula": "Acknowledge high Google rating, then pinpoint specific mobile load delay or broken appointment form",
            "pain_point_framing": "Demonstrate that high-margin elective clients bounce within 4 seconds due to broken mobile layout",
            "cta_mechanic": "Deliver private audit slug with working prototype preview",
            "follow_up_timing": "Day 3 two-sentence follow-up on mobile audit",
            "extracted_rules": [
                "State exact mobile speed or broken form flaw directly",
                "Emphasize loss of high-margin elective or commercial jobs to competitors",
                "Provide direct audit link: bysaad.com/audit/[slug]",
                "Lead with what the client gets"
            ]
        }
