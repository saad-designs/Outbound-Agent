import { Lead, DirectorPlaybookStrategy, Invoice } from "@/types/crm";

export const MOCK_LEADS: Lead[] = [
  {
    id: "lead-001",
    business_name: "Apex Roofing & Solar",
    contact_name: "Marcus Vance",
    niche: "Commercial Roofing",
    city: "Austin, TX",
    email: "marcus@apexroofingtx.com",
    phone: "+1 (512) 840-2199",
    has_website: false,
    website_url: null,
    target_type: "no_website",
    website_score: null,
    website_screenshot_url: null,
    audit_slug: "apex-roofing-austin",
    rating: 4.9,
    review_count: 87,
    top_competitor: "Austin Pro Roofing (Leads 3-pack with instant online quote intake)",
    pain_points: [
      "Zero digital footprint or verified domain; losing estimated 18-25 high-ticket commercial quote requests per month directly to Austin Pro Roofing.",
      "Google Business Profile redirects traffic to an unverified telephone number without after-hours lead capture or automated SMS response.",
      "No structured intake funnel to qualify commercial vs. residential project budgets before dispatching estimators."
    ],
    client_brief: {
      business_summary: "Tier-1 commercial roofing and solar contractor in Austin with 87 5-star reviews on Google Maps but zero online hub or booking mechanism.",
      working_model: "High-ticket commercial roof replacements ($15k–$60k avg job size) and solar additions.",
      pitch_angle: "Capture high-intent commercial property managers searching 'commercial roof repair Austin' who bounce due to lack of a professional proof-of-work portal.",
      recommended_services: [
        "Custom high-conversion Wix Studio web portal with portfolio case studies",
        "Multi-step commercial project estimator and intake form",
        "Automated lead routing and instant SMS/email confirmation",
        "Google Local Search SEO optimization"
      ]
    },
    email_subject: "Apex Roofing — 18 lost commercial quotes in Austin",
    email_draft_plain: `Marcus,

You have 87 five-star reviews on Google in Austin, but no website attached to your profile.

Austin Pro Roofing is currently sweeping the top 3 high-intent search terms for commercial repair because they offer an instant online estimator. Every commercial property manager checking your profile leaves when they can't verify your license, portfolio, or submit a bid request after hours.

We build high-performance web systems in Wix Studio designed specifically to capture commercial inquiries and qualify project budgets before you dispatch a truck.

Built a live preview of how Apex Roofing's intake portal would look:
https://bysaad.com/audit/apex-roofing-austin

Worth a 5-minute review?

Saad Bin Faisal
BYSAAD — bysaad.com`,
    email_draft_html: `<div style="background-color: #0C0C0C; color: #F2F2F2; font-family: 'DM Sans', Arial, sans-serif; padding: 32px; border: 1px solid #1A1A1A; max-width: 600px; margin: 0 auto;">
  <div style="border-bottom: 1.5px solid #C8F135; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-family: 'Oswald', Arial, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; font-size: 18px; color: #F2F2F2;">BYSAAD</span>
    <span style="font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #3A3A3A;">DIRECT INQUIRY // AUDIT-001</span>
  </div>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 16px;">Marcus,</p>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 16px;">You have <strong>87 five-star reviews</strong> on Google in Austin, but no website attached to your profile.</p>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 16px;">Austin Pro Roofing is currently sweeping the top 3 high-intent search terms for commercial repair because they offer an instant online estimator. Commercial facility managers bounce within seconds when they can't verify past work or submit specs after hours.</p>
  <div style="background: #111111; border-left: 2px solid #C8F135; padding: 16px; margin: 24px 0;">
    <p style="margin: 0; font-size: 13px; color: #F2F2F2; font-weight: 600;">LIVE AUDIT & PROTOTYPE PREPARED:</p>
    <p style="margin: 4px 0 0; font-size: 13px; color: #C8F135;">bysaad.com/audit/apex-roofing-austin</p>
  </div>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 24px;">Worth a 5-minute review?</p>
  <div style="border-top: 1px solid #1A1A1A; padding-top: 16px; margin-top: 24px;">
    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #F2F2F2;">Saad Bin Faisal</p>
    <p style="margin: 2px 0 0; font-size: 11px; color: #888888;">Founder & Web Architect, BYSAAD</p>
    <p style="margin: 2px 0 0; font-size: 11px; color: #3A3A3A;">hello@bysaad.com // bysaad.com</p>
  </div>
</div>`,
    follow_up_draft: `Marcus — following up on the Apex commercial intake setup. Did you check the interactive preview at bysaad.com/audit/apex-roofing-austin?`,
    call_battlecard: {
      hook: "Hey Marcus, Saad here with BYSAAD. Not a pitch call — noticed your Google profile has 87 five-star reviews in Austin, but zero website linked.",
      problem: "Right now Austin Pro is intercepting facility managers who look for a quote intake form after hours, costing you 15-20 commercial projects a month.",
      soft_close: "I built a 1-page interactive preview of what your commercial quote intake could look like. Can I shoot that over to your direct email?"
    },
    director_angle_id: "strat-01",
    status: "pending_approval",
    outbound_message_id: null,
    sent_at: null,
    follow_up_sent_at: null,
    replied_at: null,
    created_at: "2026-10-18T10:14:00Z"
  },
  {
    id: "lead-002",
    business_name: "Sterling Dental Care",
    contact_name: "Dr. Julian Sterling",
    niche: "Cosmetic Dentistry & Implants",
    city: "Chicago, IL",
    email: "contact@sterlingdentalchicago.com",
    phone: "+1 (312) 490-8812",
    has_website: true,
    website_url: "http://sterlingdentalchicago-old.com",
    target_type: "crappy_website",
    website_score: 34,
    website_screenshot_url: "/mock-dental.jpg",
    audit_slug: "sterling-dental-chicago",
    rating: 4.7,
    review_count: 142,
    top_competitor: "River North Smile Studio (Modern booking system + virtual smile consult intake)",
    pain_points: [
      "Non-responsive 2014 WordPress layout; 4.8s mobile load time with uncompressed hero banners.",
      "Broken appointment booking iframe causing 70%+ patient drop-off on high-ticket veneer inquiries.",
      "Zero SSL on contact forms; browsers flag 'Not Secure' warnings to prospective cosmetic patients."
    ],
    client_brief: {
      business_summary: "High-end cosmetic dental practice in Chicago with stellar reviews but severely degraded web conversion and mobile performance.",
      working_model: "High-margin elective cosmetic procedures ($3,500 – $25,000) reliant on rapid trust and immediate visual before/after proof.",
      pitch_angle: "Fix the broken mobile intake leaking $40k+/month in cosmetic consultations to River North Smile Studio.",
      recommended_services: [
        "Ultra-fast Wix Studio re-platforming with 100% mobile optimization",
        "Virtual Smile Assessment multi-step intake flow",
        "High-trust patient transformation gallery with filterable procedure tags",
        "HIPAA-compliant online booking integration"
      ]
    },
    email_subject: "Sterling Dental — broken mobile intake on Chicago cosmetic search",
    email_draft_plain: `Dr. Sterling,

Looked up your practice after seeing your 142 Google reviews in Chicago.

Your site takes nearly 5 seconds to load on mobile, and the 'Book Consultation' form throws a security warning before loading a broken iframe. Patients looking for $5k+ cosmetic veneers or implants bounce to River North Smile Studio within 3 seconds.

I rebuilt your mobile booking flow and smile assessment portal in a clean, ultra-fast architecture.

Here is the teardown and working prototype:
https://bysaad.com/audit/sterling-dental-chicago

Can I send over the 2-minute walkthrough?

Saad Bin Faisal
BYSAAD — bysaad.com`,
    email_draft_html: `<div style="background-color: #0C0C0C; color: #F2F2F2; font-family: 'DM Sans', Arial, sans-serif; padding: 32px; border: 1px solid #1A1A1A; max-width: 600px; margin: 0 auto;">
  <div style="border-bottom: 1.5px solid #C8F135; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-family: 'Oswald', Arial, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; font-size: 18px; color: #F2F2F2;">BYSAAD</span>
    <span style="font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #3A3A3A;">AUDIT SCORE: 34/100 // CRAPPY_WEBSITE</span>
  </div>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 16px;">Dr. Sterling,</p>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 16px;">Looked up your practice after seeing your <strong>142 Google reviews</strong> in Chicago.</p>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 16px;">Your site takes nearly 5 seconds to load on mobile, and the booking form throws an unsecure iframe warning. Patients looking for high-ticket elective cosmetic treatments bounce straight to River North Smile Studio.</p>
  <div style="background: #111111; border-left: 2px solid #C8F135; padding: 16px; margin: 24px 0;">
    <p style="margin: 0; font-size: 13px; color: #F2F2F2; font-weight: 600;">VISUAL AUDIT & MOBILE BLUEPRINT:</p>
    <p style="margin: 4px 0 0; font-size: 13px; color: #C8F135;">bysaad.com/audit/sterling-dental-chicago</p>
  </div>
  <p style="font-size: 15px; line-height: 1.75; color: #F2F2F2; margin-bottom: 24px;">Can I send over the 2-minute walkthrough?</p>
  <div style="border-top: 1px solid #1A1A1A; padding-top: 16px; margin-top: 24px;">
    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #F2F2F2;">Saad Bin Faisal</p>
    <p style="margin: 2px 0 0; font-size: 11px; color: #888888;">Founder & Web Architect, BYSAAD</p>
    <p style="margin: 2px 0 0; font-size: 11px; color: #3A3A3A;">hello@bysaad.com // bysaad.com</p>
  </div>
</div>`,
    follow_up_draft: `Dr. Sterling — wanted to ensure you saw the note regarding the broken booking iframe on your mobile page. Did you check bysaad.com/audit/sterling-dental-chicago?`,
    call_battlecard: {
      hook: "Dr. Sterling, Saad here from BYSAAD. Calling because your Google listing is active with 142 reviews, but your mobile appointment page throws an unsecure iframe error.",
      problem: "Patients searching for cosmetic consults in Chicago are bouncing straight to River North Smile Studio because mobile load time exceeds 4.8 seconds.",
      soft_close: "We mapped out the 3 points where patients drop off and fixed it in a live prototype. Open to taking a look today?"
    },
    director_angle_id: "strat-02",
    status: "pending_approval",
    outbound_message_id: null,
    sent_at: null,
    follow_up_sent_at: null,
    replied_at: null,
    created_at: "2026-10-18T11:05:00Z"
  },
  {
    id: "lead-003",
    business_name: "Ironclad HVAC & Mechanical",
    contact_name: "Brett Henderson",
    niche: "Commercial HVAC",
    city: "Dallas, TX",
    email: "b.henderson@ironcladhvac.com",
    phone: "+1 (214) 773-1029",
    has_website: true,
    website_url: "https://ironclad-cooling.com",
    target_type: "crappy_website",
    website_score: 28,
    website_screenshot_url: null,
    audit_slug: "ironclad-hvac-dallas",
    rating: 4.8,
    review_count: 63,
    top_competitor: "Lone Star Mechanical",
    pain_points: [
      "Broken mobile emergency dispatch contact form.",
      "Outdated HTTP links causing security flags."
    ],
    client_brief: {
      business_summary: "Commercial HVAC service contractor in DFW area.",
      working_model: "Preventative maintenance contracts and emergency repair.",
      pitch_angle: "Fix mobile emergency call capture to seize night-shift plant repairs.",
      recommended_services: ["Wix Studio Emergency Intake Form", "SEO Local Pack"]
    },
    email_subject: "Ironclad HVAC — emergency dispatch form failure",
    email_draft_plain: `Brett, noticed your emergency dispatch form on mobile is failing. Sent audit link: bysaad.com/audit/ironclad-hvac-dallas`,
    email_draft_html: `<div style="background-color: #0C0C0C; color: #F2F2F2; padding: 24px;">Emergency Dispatch Audit</div>`,
    follow_up_draft: `Brett, following up on Ironclad HVAC.`,
    call_battlecard: {
      hook: "Brett, Saad here with BYSAAD. Calling because your emergency night-dispatch button is broken on mobile.",
      problem: "Facility managers in Dallas are bouncing to Lone Star Mechanical.",
      soft_close: "Can I text you the direct video proof?"
    },
    director_angle_id: "strat-01",
    status: "replied_hot",
    outbound_message_id: "msg-9921",
    sent_at: "2026-10-16T14:20:00Z",
    follow_up_sent_at: null,
    replied_at: "2026-10-17T09:12:00Z",
    created_at: "2026-10-16T12:00:00Z"
  },
  {
    id: "lead-004",
    business_name: "Highland Precision Law",
    contact_name: "Eleanor Vance, Esq.",
    niche: "Corporate Litigation",
    city: "New York, NY",
    email: "evance@highlandplaw.com",
    phone: "+1 (212) 555-0198",
    has_website: false,
    website_url: null,
    target_type: "no_website",
    website_score: null,
    website_screenshot_url: null,
    audit_slug: "highland-precision-law",
    rating: 5.0,
    review_count: 31,
    top_competitor: "Lexington Corporate Counsel",
    pain_points: [
      "No digital firm profile for enterprise procurement verification."
    ],
    client_brief: {
      business_summary: "Boutique corporate litigation practice.",
      working_model: "Retainer-based corporate defense.",
      pitch_angle: "Establish elite modern firm portal for client diligence.",
      recommended_services: ["Brand identity & typography system", "Wix Studio corporate portal"]
    },
    email_subject: "Highland Precision — enterprise procurement verification",
    email_draft_plain: `Eleanor, built a confidential portal preview: bysaad.com/audit/highland-precision-law`,
    email_draft_html: `<div>Confidential Audit</div>`,
    follow_up_draft: `Eleanor, following up on corporate portal.`,
    call_battlecard: {
      hook: "Eleanor, Saad here with BYSAAD. Noticed corporate counsel vetting your firm have no credentials hub.",
      problem: "Enterprise legal departments require verified web security credentials before retaining.",
      soft_close: "Can I send over the secure prototype link?"
    },
    director_angle_id: "strat-02",
    status: "ghosted_call_required",
    outbound_message_id: "msg-8812",
    sent_at: "2026-10-12T16:00:00Z",
    follow_up_sent_at: "2026-10-15T16:00:00Z",
    replied_at: null,
    created_at: "2026-10-12T10:00:00Z"
  }
];

export const MOCK_STRATEGIES: DirectorPlaybookStrategy[] = [
  {
    id: "strat-01",
    source_type: "youtube_transcript",
    source_url: "https://www.youtube.com/watch?v=sample1",
    strategy_name: "Quantified Inaction Cost (Alex Hormozi Framework)",
    extracted_rules: [
      "State exact number of verified Google reviews in the first sentence.",
      "Name the exact top competitor intercepting their traffic.",
      "Calculate lost quote volume (e.g. 15-25 deals/mo) rather than vague 'missing revenue'.",
      "Zero greetings like 'Hope you are well' or 'My name is Saad and I am'."
    ],
    emails_sent: 48,
    replies_received: 14,
    hot_leads_generated: 6,
    conversion_score: 29.2,
    is_active: true,
    created_at: "2026-10-14T08:00:00Z"
  },
  {
    id: "strat-02",
    source_type: "manual_rule",
    source_url: null,
    strategy_name: "Mobile Speed & Security Warning Callout (Local Service Pros)",
    extracted_rules: [
      "Highlight 4+ second mobile delay specifically for high-ticket elective procedures.",
      "Reference browser 'Not Secure' warnings directly to doctors or attorneys who care about reputation.",
      "Include personalized audit slug link: bysaad.com/audit/[slug].",
      "Offer 2-minute video walkthrough as the low-friction CTA."
    ],
    emails_sent: 35,
    replies_received: 9,
    hot_leads_generated: 4,
    conversion_score: 25.7,
    is_active: true,
    created_at: "2026-10-15T09:30:00Z"
  },
  {
    id: "strat-03",
    source_type: "performance_insight",
    source_url: null,
    strategy_name: "Two-Sentence Follow-Up Bump",
    extracted_rules: [
      "Follow-up must not repeat pitch; only ask if they reviewed the audit slug link.",
      "Send exactly 72 hours after initial touchpoint.",
      "Keep under 30 words total."
    ],
    emails_sent: 24,
    replies_received: 7,
    hot_leads_generated: 3,
    conversion_score: 29.1,
    is_active: true,
    created_at: "2026-10-16T11:00:00Z"
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    lead_id: "lead-001",
    business_name: "Apex Roofing & Solar",
    contact_name: "Marcus Vance",
    client_email: "marcus@apexroofingtx.com",
    client_city: "Austin, TX",
    invoice_number: "#001",
    issue_date: "2026-10-18",
    due_date: "2026-11-01",
    line_items: [
      {
        id: "item-1",
        service: "Full Website Build in Wix Studio",
        description: "Commercial roofing portal with responsive portfolio architecture, fast mobile load, and on-page SEO setup.",
        amount: 3200
      },
      {
        id: "item-2",
        service: "Multi-Step Commercial Intake & Estimator",
        description: "Custom project scope estimator with automated lead routing, SMS notifications, and budget qualification.",
        amount: 1400
      },
      {
        id: "item-3",
        service: "Brand Identity & Type System",
        description: "Complete visual guidelines, color palette, typographic lockup, and usage assets.",
        amount: 900
      }
    ],
    total_amount: 5500,
    deposit_amount: 2750,
    status: "draft",
    created_at: "2026-10-18T12:00:00Z"
  }
];
