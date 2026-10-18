import json
from db import get_db_connection

def seed():
    conn = get_db_connection()
    if not conn:
        print("[!] Failed to connect to PostgreSQL")
        return

    cur = conn.cursor()

    cur.execute("SELECT id, strategy_name FROM director_playbook;")
    playbooks = {r[1]: str(r[0]) for r in cur.fetchall()}
    print("[*] Available Playbooks in DB:", playbooks)

    strat_hormozi = playbooks.get("Quantified Inaction Cost (Alex Hormozi Framework)")
    strat_mobile = playbooks.get("Mobile Speed & Security Warning Callout (Local Service Pros)")
    strat_bump = playbooks.get("Two-Sentence Follow-Up Bump")

    leads_to_insert = [
        {
            "business_name": "Apex Roofing & Solar",
            "contact_name": "Marcus Vance",
            "niche": "Commercial Roofing",
            "city": "Austin, TX",
            "email": "marcus@apexroofingtx.com",
            "phone": "+1 (512) 840-2199",
            "has_website": False,
            "website_url": None,
            "target_type": "no_website",
            "website_score": None,
            "website_screenshot_url": None,
            "audit_slug": "apex-roofing-austin",
            "rating": 4.9,
            "review_count": 87,
            "top_competitor": "Austin Pro Roofing (Leads 3-pack with instant online quote intake)",
            "pain_points": json.dumps([
                "Zero digital footprint or verified domain; losing estimated 18-25 high-ticket commercial quote requests per month directly to Austin Pro Roofing.",
                "Google Business Profile redirects traffic to an unverified telephone number without after-hours lead capture or automated SMS response.",
                "No structured intake funnel to qualify commercial vs. residential project budgets before dispatching estimators."
            ]),
            "client_brief": json.dumps({
                "business_summary": "Tier-1 commercial roofing and solar contractor in Austin with 87 5-star reviews on Google Maps but zero online hub or booking mechanism.",
                "working_model": "High-ticket commercial roof replacements ($15k–$60k avg job size) and solar additions.",
                "pitch_angle": "Capture high-intent commercial property managers searching commercial roof repair Austin who bounce due to lack of a professional proof-of-work portal.",
                "recommended_services": [
                    "Custom high-conversion Wix Studio web portal with portfolio case studies",
                    "Multi-step commercial project estimator and intake form",
                    "Automated lead routing and instant SMS/email confirmation"
                ]
            }),
            "email_subject": "Apex Roofing — 18 lost commercial quotes in Austin",
            "email_draft_plain": "Marcus,\n\nYou have 87 five-star reviews on Google in Austin, but no website attached to your profile.\n\nAustin Pro Roofing is currently sweeping the top 3 high-intent search terms for commercial repair because they offer an instant online estimator. Every commercial property manager checking your profile leaves when they cannot verify your license, portfolio, or submit a bid request after hours.\n\nWe build high-performance web systems in Wix Studio designed specifically to capture commercial inquiries and qualify project budgets before you dispatch a truck.\n\nBuilt a live preview of how Apex Roofing intake portal would look:\nhttps://bysaad.com/audit/apex-roofing-austin\n\nWorth a 5-minute review?\n\nSaad Bin Faisal\nBYSAAD · bysaad.com",
            "email_draft_html": "<div style=\"background-color: #0C0C0C; color: #F2F2F2; font-family: 'DM Sans', Arial, sans-serif; padding: 32px; border: 1px solid #1A1A1A; max-width: 600px; margin: 0 auto;\"><div style=\"border-bottom: 1.5px solid #C8F135; padding-bottom: 16px; margin-bottom: 24px;\"><span style=\"font-family: 'Oswald', Arial, sans-serif; font-weight: 600; text-transform: uppercase; font-size: 18px; color: #F2F2F2;\">BYSAAD</span></div><p>Marcus,</p><p>You have 87 five-star reviews on Google in Austin, but no website attached to your profile.</p><p><a href=\"https://bysaad.com/audit/apex-roofing-austin\" style=\"background-color: #C8F135; color: #0C0C0C; font-family: 'Oswald', Arial, sans-serif; font-weight: 600; text-transform: uppercase; padding: 14px 28px; text-decoration: none;\">VIEW LIVE AUDIT &rarr;</a></p></div>",
            "follow_up_draft": "Marcus, following up on Apex Roofing — commercial roof replacement inquiries in Austin.",
            "call_battlecard": json.dumps({
                "hook": "Marcus, Saad here with BYSAAD. Calling because you have 87 five-star reviews on Google in Austin, but zero website attached to your business profile.",
                "problem": "Austin Pro Roofing is sweeping up every commercial property manager who searches commercial roof repair Austin because they have an instant online intake form.",
                "soft_close": "I built a live interactive preview of how Apex Roofing intake portal would look — can I text you the link?"
            }),
            "director_angle_id": strat_hormozi,
            "status": "pending_approval"
        },
        {
            "business_name": "Sterling Implant & Cosmetic Dental",
            "contact_name": "Dr. Julian Sterling, DDS",
            "niche": "Cosmetic Dentistry",
            "city": "Denver, CO",
            "email": "frontdesk@sterlingdentistrydenver.com",
            "phone": "+1 (303) 991-4420",
            "has_website": True,
            "website_url": "https://sterlingdentistrydenver.com",
            "target_type": "crappy_website",
            "website_score": 32,
            "website_screenshot_url": None,
            "audit_slug": "sterling-implant-dental",
            "rating": 4.9,
            "review_count": 114,
            "top_competitor": "Cherry Creek Smile Institute",
            "pain_points": json.dumps([
                "4.8 second mobile page load time causing 68 percent mobile bounce rate on high-ticket cosmetic search clicks.",
                "SSL certificate chain warnings and missing mobile viewport causing mobile browsers to show unoptimized layout.",
                "PDF medical intake forms instead of a frictionless digital scheduling engine."
            ]),
            "client_brief": json.dumps({
                "business_summary": "Premier restorative and implant dentistry clinic in Denver with high-end operatory equipment but an outdated 2017 template site.",
                "working_model": "Full-arch All-on-4 restorations ($25k–$45k cases) and Invisalign.",
                "pitch_angle": "Cut the 4.8s mobile lag to under 800ms and introduce a VIP smile simulation intake engine.",
                "recommended_services": [
                    "Wix Studio custom medical spa aesthetic web application",
                    "HIPAA-compliant digital medical intake & smile assessment questionnaire"
                ]
            }),
            "email_subject": "Sterling Dental — 4.8s mobile delay on All-on-4 traffic",
            "email_draft_plain": "Dr. Sterling,\n\nYour clinical reputation in Denver is unmatched — 114 verified reviews at 4.9 stars.\n\nHowever, when prospective patients click your profile on mobile, the site takes 4.8 seconds to load and prompts an insecure connection warning.\n\nCherry Creek Smile Institute captures prospective implant cases before your page finishes rendering.\n\nRan a speed & conversion breakdown on your mobile flow:\nhttps://bysaad.com/audit/sterling-implant-dental\n\nSaad Bin Faisal\nBYSAAD · bysaad.com",
            "email_draft_html": "<div style=\"background-color: #0C0C0C; color: #F2F2F2; padding: 24px;\"><p>Dr. Sterling, 4.8s mobile delay audit: <a href=\"https://bysaad.com/audit/sterling-implant-dental\">View Audit</a></p></div>",
            "follow_up_draft": "Dr. Sterling, following up on the 4.8s mobile delay on All-on-4 inquiries.",
            "call_battlecard": json.dumps({
                "hook": "Dr. Sterling, Saad here with BYSAAD. Calling because your clinic has 114 five-star reviews in Denver, but your mobile site takes nearly 5 seconds to load.",
                "problem": "High-ticket implant patients click your listing and bounce right to Cherry Creek Smile Institute before the before/after gallery opens.",
                "soft_close": "I put together a 3-minute forensic audit showing how we get that load time to under 800ms — can I send that over?"
            }),
            "director_angle_id": strat_mobile,
            "status": "pending_approval"
        },
        {
            "business_name": "Ironclad Mechanical & Commercial HVAC",
            "contact_name": "Brett Holstrom",
            "niche": "Commercial HVAC",
            "city": "Dallas, TX",
            "email": "brett@ironcladmech.com",
            "phone": "+1 (214) 773-0091",
            "has_website": True,
            "website_url": "https://ironcladmech.com",
            "target_type": "crappy_website",
            "website_score": 28,
            "website_screenshot_url": None,
            "audit_slug": "ironclad-hvac-dallas",
            "rating": 4.8,
            "review_count": 63,
            "top_competitor": "Lone Star Mechanical",
            "pain_points": json.dumps([
                "Broken mobile emergency dispatch contact form. Outdated HTTP links causing security flags."
            ]),
            "client_brief": json.dumps({
                "business_summary": "Commercial HVAC service contractor in DFW area.",
                "working_model": "Preventative maintenance contracts and emergency repair.",
                "pitch_angle": "Fix mobile emergency call capture to seize night-shift plant repairs.",
                "recommended_services": ["Emergency intake portal", "Mobile dispatch web app"]
            }),
            "email_subject": "Ironclad HVAC — emergency dispatch form failure",
            "email_draft_plain": "Brett, noticed your emergency dispatch form on mobile is failing. Sent audit link: bysaad.com/audit/ironclad-hvac-dallas",
            "email_draft_html": "<div style=\"background-color: #0C0C0C; color: #F2F2F2; padding: 24px;\">Emergency Dispatch Audit</div>",
            "follow_up_draft": "Brett, following up on Ironclad HVAC.",
            "call_battlecard": json.dumps({
                "hook": "Brett, Saad here with BYSAAD. Calling because your emergency night-dispatch button is broken on mobile.",
                "problem": "Facility managers in Dallas are bouncing to Lone Star Mechanical.",
                "soft_close": "Can I text you the direct video proof?"
            }),
            "director_angle_id": strat_hormozi,
            "status": "replied_hot"
        },
        {
            "business_name": "Highland Precision Law",
            "contact_name": "Eleanor Vance, Esq.",
            "niche": "Corporate Litigation",
            "city": "New York, NY",
            "email": "evance@highlandplaw.com",
            "phone": "+1 (212) 555-0198",
            "has_website": False,
            "website_url": None,
            "target_type": "no_website",
            "website_score": None,
            "website_screenshot_url": None,
            "audit_slug": "highland-precision-law",
            "rating": 5.0,
            "review_count": 31,
            "top_competitor": "Lexington Corporate Counsel",
            "pain_points": json.dumps([
                "No digital firm profile for enterprise procurement verification."
            ]),
            "client_brief": json.dumps({
                "business_summary": "Boutique corporate litigation practice.",
                "working_model": "Retainer-based corporate defense.",
                "pitch_angle": "Establish elite modern firm portal for client diligence.",
                "recommended_services": ["Elite firm portal", "Secure credentials hub"]
            }),
            "email_subject": "Highland Precision — enterprise procurement verification",
            "email_draft_plain": "Eleanor, built a confidential portal preview: bysaad.com/audit/highland-precision-law",
            "email_draft_html": "<div>Confidential Audit</div>",
            "follow_up_draft": "Eleanor, following up on corporate portal.",
            "call_battlecard": json.dumps({
                "hook": "Eleanor, Saad here with BYSAAD. Noticed corporate counsel vetting your firm have no credentials hub.",
                "problem": "Enterprise legal departments require verified web security credentials before retaining.",
                "soft_close": "Can I send over the secure prototype link?"
            }),
            "director_angle_id": strat_bump,
            "status": "ghosted_call_required"
        },
        {
            "business_name": "Live Client Dental",
            "contact_name": "Clinical Director",
            "niche": "Local Service",
            "city": "Austin, TX",
            "email": "contact@example.com",
            "phone": "+1 (512) 555-0144",
            "has_website": True,
            "website_url": "https://example.com",
            "target_type": "crappy_website",
            "website_score": 15,
            "website_screenshot_url": "/audits/example-com.png",
            "audit_slug": "example-com",
            "rating": 4.8,
            "review_count": 45,
            "top_competitor": "Category Leader",
            "pain_points": json.dumps([
                "Complete absence of commercial value proposition, brand identity, or visual hierarchy required to retain visitors.",
                "Monolithic, center-aligned multilingual text block creates cognitive fatigue with zero scannable visual structure.",
                "Total lack of lead capture infrastructure, relying exclusively on a raw, unstyled inline hyperlink with no strategic call-to-action."
            ]),
            "client_brief": json.dumps({
                "business_summary": "Live Client Dental is an established local dental clinic with an exceptional 4.8-star track record over 45 reviews.",
                "working_model": "Elective cosmetic dentistry, aligners, and implant cases valued between $1,500 and $5,000+ per treatment plan.",
                "pitch_angle": "Replace an outdated, friction-heavy page with a structured intake system that turns local search traffic into confirmed consultations.",
                "recommended_services": ["Full website build in Wix Studio", "Multi-step intake forms & lead-capture systems", "Complete site copywriting"]
            }),
            "email_subject": "live client dental — website breakdown",
            "email_draft_plain": "You have earned a solid 4.8-star reputation across 45 reviews, but your website is currently working against you.\n\nRight now, prospective patients land on an unformatted block of center-aligned text with no structured booking system.\n\nTake a look at the live audit: https://bysaad.com/audit/example-com\n\nSaad Bin Faisal\nBYSAAD · bysaad.com",
            "email_draft_html": "<div style=\"background-color: #0C0C0C; color: #F2F2F2; padding: 24px;\"><p>Live Client Dental Audit: <a href=\"https://bysaad.com/audit/example-com\">View Audit</a></p></div>",
            "follow_up_draft": "Following up on the conversion tear-down I sent over: https://bysaad.com/audit/example-com.",
            "call_battlecard": json.dumps({
                "hook": "Saw your 4.8-star rating on Google, but noticed your mobile site forces patients to hunt down a raw link just to schedule an appointment.",
                "problem": "High-value cosmetic and implant cases bounce within four seconds due to an unformatted layout.",
                "soft_close": "I put together a short visual tear-down — can I send the direct link to your inbox?"
            }),
            "director_angle_id": strat_mobile,
            "status": "pending_approval"
        }
    ]

    for l in leads_to_insert:
        cur.execute("""
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
                status = EXCLUDED.status;
        """, (
            l["business_name"], l["contact_name"], l["niche"], l["city"], l["email"], l["phone"],
            l["has_website"], l["website_url"], l["target_type"], l["website_score"],
            l["website_screenshot_url"], l["audit_slug"], l["rating"], l["review_count"],
            l["top_competitor"], l["pain_points"], l["client_brief"], l["email_subject"],
            l["email_draft_plain"], l["email_draft_html"], l["follow_up_draft"],
            l["call_battlecard"], l["director_angle_id"], l["status"]
        ))
        print(f"[+] Seeded lead: {l['business_name']} ({l['audit_slug']})")

    # Seed an invoice for Apex Roofing
    cur.execute("SELECT id FROM leads WHERE audit_slug = 'apex-roofing-austin';")
    apex_lead = cur.fetchone()
    if apex_lead:
        cur.execute("""
            INSERT INTO invoices (
                lead_id, invoice_number, issue_date, due_date, line_items, total_amount, deposit_amount, status
            ) VALUES (
                %s, %s, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', %s, %s, %s, 'draft'
            )
            ON CONFLICT (invoice_number) DO NOTHING;
        """, (
            apex_lead[0],
            "#001",
            json.dumps([
                {"desc": "Custom High-Conversion Wix Studio Commercial Portal", "amount": 3500},
                {"desc": "Multi-Step Dynamic Quote & Project Estimator Engine", "amount": 1200},
                {"desc": "Automated Lead Routing, SMS Intake & Speed-to-Lead Integration", "amount": 800}
            ]),
            5500,
            2750
        ))
        print("[+] Seeded invoice #001")

    cur.execute("SELECT count(*) FROM leads;")
    print("TOTAL LEADS IN POSTGRESQL DB:", cur.fetchone()[0])
    cur.execute("SELECT count(*) FROM invoices;")
    print("TOTAL INVOICES IN POSTGRESQL DB:", cur.fetchone()[0])

    conn.close()

if __name__ == "__main__":
    seed()
