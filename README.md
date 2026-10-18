# BYSAAD — Autonomous Outbound CRM Engine & Client Audit Portal

> **Engineered for Saad Bin Faisal (`BYSAAD`)**  
> High-ticket B2B outbound sales automation, dual-target Playwright scraper, multimodal Gemini 2.5/3.8 Flash visual auditor, self-learning YouTube sales director, and Next.js dark-mode CRM dashboard.

---

## ⚡ Architecture Overview

```text
outbound-crm-engine/
├── schema.sql              # Supabase / PostgreSQL schema (leads, director_playbook, invoices)
├── scraper/                # Python engine (Playwright, google-genai, YouTube transcript API)
│   ├── main.py             # CLI orchestrator (--scrape, --audit-url, --learn-youtube)
│   ├── maps_scraper.py     # Dual-target Google Maps scraper (Route A: no-web, Route B: crappy-web)
│   ├── website_auditor.py  # DOM analysis & Gemini multimodal vision auditor
│   ├── director.py         # Self-learning YouTube transcript parser & conversion telemetry
│   ├── copywriter.py       # Brand-guarded copywriter & locked dark HTML email builder
│   ├── brand_rules.py      # Locked constants, banned corporate phrases, and voice rules
│   └── requirements.txt    # Python dependencies
└── web/                    # Next.js App Router (TypeScript, Tailwind CSS, Lucide icons)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            # BYSAAD CRM Dashboard (Approval Queue, Pipeline, Director, Billing)
    │   │   ├── audit/[slug]/       # High-converting client audit report landing portal
    │   │   └── api/                # REST endpoints (crm, scraper/run, email/send, webhooks, cron)
    │   ├── components/             # SMark vector, Sidebar, Modals, Operational Views
    │   └── lib/                    # Supabase client & hybrid data bridge
    └── public/audits/              # Captured 1280x800 viewport audit screenshots
```

---

## 🎨 Locked BYSAAD Visual System

The user interface strictly adheres to the locked **BYSAAD** design system:
- **Canvas / Background**: `#0C0C0C` (Dark, flat, distraction-free)
- **Surfaces & Cards**: `#111111` (Elevated dark panels)
- **Dividers & Outlines**: `#1A1A1A` (1px solid borders)
- **Primary Typography**: `#F2F2F2`
- **Muted Meta Labels**: `#3A3A3A` (`9px`, `0.18em` tracking, uppercase DM Sans)
- **Single Acid-Lime Rule**: `#C8F135` used exclusively for the single primary CTA per view
- **Typography Tokens**:
  - Headings / Display: `Oswald` 600 SemiBold, ALL-CAPS ALWAYS, `0.005em` tracking
  - Body Copy: `DM Sans` 400, `1.75` line-height
- **Zero Ornamentation**: Maximum `2px` border radius (`rounded-[2px]`), zero box shadows, zero gradients, zero glows.
- **`<SMark />` Vector**: Signature brand icon with open top-right corner gap, center 'S', and lower-left white accent dash.

---

## 🚀 Quick Start

### 1. Environment Configuration

Copy `.env.example` in both `/scraper` and `/web`:

```bash
# In /scraper/.env
GEMINI_API_KEY="your-gemini-api-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-service-role-key"

# In /web/.env.local
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
GEMINI_API_KEY="your-gemini-api-key"
RESEND_API_KEY="re_..."
```

### 2. Python Scraper & Auditor Setup

```bash
cd scraper
pip install -r requirements.txt
python -m playwright install chromium

# Run Google Maps batch scraper & auditor:
python main.py --scrape --niche "Commercial Roofing" --city "Austin, TX" --limit 5 --dry-run

# Run instant single-site visual teardown:
python main.py --audit-url "https://example.com" --name "Client Practice" --dry-run

# Ingest tactical sales rules from a YouTube video:
python main.py --learn-youtube "https://www.youtube.com/watch?v=VIDEO_ID" --dry-run
```

### 3. Next.js Dashboard & Live Audit Portal

```bash
cd web
npm install
npm run dev
```

Visit:
- **Dashboard**: `http://localhost:3000`
- **Live Client Audit Portal**: `http://localhost:3000/audit/[slug]`

---

## 🔒 Security

All secrets, `.env` files, and local state caches are strictly excluded via `.gitignore`.
Never commit live API keys or production database credentials to version control.
