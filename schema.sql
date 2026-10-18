-- ==============================================================================
-- BYSAAD OUTBOUND CRM ENGINE — DATABASE SCHEMA
-- Target Database: Supabase / PostgreSQL
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_target_type') THEN
        CREATE TYPE lead_target_type AS ENUM (
            'no_website',
            'crappy_website'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
        CREATE TYPE lead_status AS ENUM (
            'scraped_auditing',
            'pending_approval',
            'emailed_step_1',
            'follow_up_due',
            'ghosted_call_required',
            'replied_hot',
            'replied_cold',
            'bounced',
            'closed_won'
        );
    END IF;
END $$;

-- 2. TABLE: director_playbook (Self-learning AI brain & YouTube knowledge store)
CREATE TABLE IF NOT EXISTS director_playbook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('youtube_transcript', 'manual_rule', 'performance_insight')),
    source_url TEXT,
    strategy_name TEXT NOT NULL,
    extracted_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    emails_sent INT DEFAULT 0,
    replies_received INT DEFAULT 0,
    hot_leads_generated INT DEFAULT 0,
    conversion_score NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLE: leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_name TEXT,
    niche TEXT NOT NULL,
    city TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    has_website BOOLEAN DEFAULT false,
    website_url TEXT,
    target_type lead_target_type NOT NULL,
    website_score INT,
    website_screenshot_url TEXT,
    audit_slug TEXT UNIQUE NOT NULL,
    rating NUMERIC,
    review_count INT,
    top_competitor TEXT,
    pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    client_brief JSONB NOT NULL DEFAULT '{}'::jsonb,
    email_subject TEXT,
    email_draft_plain TEXT,
    email_draft_html TEXT,
    follow_up_draft TEXT,
    call_battlecard JSONB,
    director_angle_id UUID REFERENCES director_playbook(id) ON DELETE SET NULL,
    status lead_status DEFAULT 'scraped_auditing',
    outbound_message_id TEXT,
    sent_at TIMESTAMPTZ,
    follow_up_sent_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLE: invoices (BYSAAD Invoice System)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL,
    deposit_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_target_type ON leads(target_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_lead_id ON invoices(lead_id);
