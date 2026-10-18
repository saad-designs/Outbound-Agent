export type LeadTargetType = 'no_website' | 'crappy_website';

export type LeadStatus =
  | 'scraped_auditing'
  | 'pending_approval'
  | 'emailed_step_1'
  | 'follow_up_due'
  | 'ghosted_call_required'
  | 'replied_hot'
  | 'replied_cold'
  | 'bounced'
  | 'closed_won';

export interface ClientBrief {
  business_summary: string;
  working_model: string;
  pitch_angle: string;
  recommended_services: string[];
}

export interface CallBattlecard {
  hook: string;
  problem: string;
  soft_close: string;
}

export interface Lead {
  id: string;
  business_name: string;
  contact_name: string | null;
  niche: string;
  city: string;
  email: string | null;
  phone: string | null;
  has_website: boolean;
  website_url: string | null;
  target_type: LeadTargetType;
  website_score: number | null;
  website_screenshot_url: string | null;
  audit_slug: string;
  rating: number | null;
  review_count: number | null;
  top_competitor: string | null;
  pain_points: string[];
  client_brief: ClientBrief;
  email_subject: string | null;
  email_draft_plain: string | null;
  email_draft_html: string | null;
  follow_up_draft: string | null;
  call_battlecard: CallBattlecard | null;
  director_angle_id: string | null;
  status: LeadStatus;
  outbound_message_id: string | null;
  sent_at: string | null;
  follow_up_sent_at: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface DirectorPlaybookStrategy {
  id: string;
  source_type: 'youtube_transcript' | 'manual_rule' | 'performance_insight';
  source_url: string | null;
  strategy_name: string;
  extracted_rules: string[];
  emails_sent: number;
  replies_received: number;
  hot_leads_generated: number;
  conversion_score: number;
  is_active: boolean;
  created_at: string;
}

export interface InvoiceLineItem {
  id: string;
  service: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  lead_id: string;
  business_name: string;
  contact_name: string;
  client_email: string;
  client_city: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  line_items: InvoiceLineItem[];
  total_amount: number;
  deposit_amount: number;
  status: 'draft' | 'issued' | 'paid';
  created_at: string;
}
