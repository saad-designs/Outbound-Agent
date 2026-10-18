import fs from "fs";
import path from "path";
import { Lead, DirectorPlaybookStrategy, Invoice } from "@/types/crm";
import { MOCK_LEADS, MOCK_STRATEGIES, MOCK_INVOICES } from "@/data/mockData";
import { getSupabase } from "./supabase";
import { getPostgresPool } from "./postgres";

const LOCAL_STATE_FILE = path.join(process.cwd(), ".local_crm_state.json");
const SCRAPER_OUTPUT_FILE = path.join(process.cwd(), "..", "scraper", "dry_run_output.json");

interface CRMState {
  leads: Lead[];
  playbooks: DirectorPlaybookStrategy[];
  invoices: Invoice[];
}

function readJSONSafe<T>(filePath: string): T | null {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`[dataBridge] Warning reading ${filePath}:`, err);
  }
  return null;
}

function writeJSONSafe(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`[dataBridge] Error writing ${filePath}:`, err);
  }
}

export async function getCRMData(): Promise<CRMState> {
  const pool = getPostgresPool();
  const supabase = getSupabase();

  let state: CRMState = {
    leads: [],
    playbooks: [],
    invoices: [],
  };

  // 1. Try Direct PostgreSQL Pool First
  if (pool) {
    try {
      const [leadsRes, playbooksRes, invoicesRes] = await Promise.all([
        pool.query("SELECT * FROM leads ORDER BY created_at DESC;"),
        pool.query("SELECT * FROM director_playbook ORDER BY conversion_score DESC;"),
        pool.query("SELECT * FROM invoices ORDER BY created_at DESC;"),
      ]);

      if (leadsRes.rows) state.leads = leadsRes.rows as Lead[];
      if (playbooksRes.rows) state.playbooks = playbooksRes.rows as DirectorPlaybookStrategy[];
      if (invoicesRes.rows) state.invoices = invoicesRes.rows as Invoice[];
    } catch (pgErr) {
      console.warn("[dataBridge] PostgreSQL pool query error, falling back:", pgErr);
    }
  }

  // 2. Try Supabase REST Client if PostgreSQL didn't populate
  if (state.leads.length === 0 && state.playbooks.length === 0 && supabase) {
    try {
      const [leadsRes, playbooksRes, invoicesRes] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("director_playbook").select("*").order("conversion_score", { ascending: false }),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      ]);

      if (leadsRes.data && leadsRes.data.length > 0) state.leads = leadsRes.data as Lead[];
      if (playbooksRes.data && playbooksRes.data.length > 0) state.playbooks = playbooksRes.data as DirectorPlaybookStrategy[];
      if (invoicesRes.data && invoicesRes.data.length > 0) state.invoices = invoicesRes.data as Invoice[];
    } catch (err) {
      console.warn("[dataBridge] Supabase REST query failed:", err);
    }
  }

  // 3. Fall back to local state file or mock data if still empty
  if (state.leads.length === 0) {
    const localState = readJSONSafe<CRMState>(LOCAL_STATE_FILE);
    if (localState && Array.isArray(localState.leads) && localState.leads.length > 0) {
      state.leads = localState.leads;
      if (state.playbooks.length === 0) state.playbooks = localState.playbooks || [...MOCK_STRATEGIES];
      if (state.invoices.length === 0) state.invoices = localState.invoices || [...MOCK_INVOICES];
    } else {
      state.leads = [...MOCK_LEADS];
      if (state.playbooks.length === 0) state.playbooks = [...MOCK_STRATEGIES];
      if (state.invoices.length === 0) state.invoices = [...MOCK_INVOICES];
    }
  }

  // 4. Automatically merge freshly audited leads from /scraper/dry_run_output.json
  const dryRunLeads = readJSONSafe<Partial<Lead>[]>(SCRAPER_OUTPUT_FILE);
  if (dryRunLeads && Array.isArray(dryRunLeads)) {
    let hasNewMerge = false;
    for (const dl of dryRunLeads) {
      if (!dl.audit_slug) continue;

      const existingIndex = state.leads.findIndex(
        (l) => l.audit_slug === dl.audit_slug || (dl.id && l.id === dl.id)
      );

      if (existingIndex >= 0) {
        state.leads[existingIndex] = {
          ...state.leads[existingIndex],
          ...dl,
          id: state.leads[existingIndex].id,
        } as Lead;
      } else {
        const newLead: Lead = {
          id: dl.id || `lead-scraped-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          business_name: dl.business_name || "New Audited Prospect",
          contact_name: dl.contact_name || null,
          niche: dl.niche || "Commercial Service",
          city: dl.city || "Austin, TX",
          email: dl.email || null,
          phone: dl.phone || null,
          has_website: dl.has_website ?? false,
          website_url: dl.website_url || null,
          target_type: dl.target_type || (dl.has_website ? "crappy_website" : "no_website"),
          website_score: dl.website_score ?? null,
          website_screenshot_url: dl.website_screenshot_url || null,
          audit_slug: dl.audit_slug,
          rating: dl.rating || 4.8,
          review_count: dl.review_count || 30,
          top_competitor: dl.top_competitor || "Local Market Leader",
          pain_points: dl.pain_points || [],
          client_brief: dl.client_brief || {
            business_summary: "",
            working_model: "",
            pitch_angle: "",
            recommended_services: [],
          },
          email_subject: dl.email_subject || null,
          email_draft_plain: dl.email_draft_plain || null,
          email_draft_html: dl.email_draft_html || null,
          follow_up_draft: dl.follow_up_draft || null,
          call_battlecard: dl.call_battlecard || null,
          director_angle_id: dl.director_angle_id || "strat-01",
          status: dl.status || "pending_approval",
          outbound_message_id: dl.outbound_message_id || null,
          sent_at: dl.sent_at || null,
          follow_up_sent_at: dl.follow_up_sent_at || null,
          replied_at: dl.replied_at || null,
          created_at: dl.created_at || new Date().toISOString(),
        };
        state.leads.unshift(newLead);
        hasNewMerge = true;
      }
    }

    if (hasNewMerge) {
      writeJSONSafe(LOCAL_STATE_FILE, state);
    }
  }

  writeJSONSafe(LOCAL_STATE_FILE, state);
  return state;
}

export async function saveCRMData(state: CRMState): Promise<void> {
  writeJSONSafe(LOCAL_STATE_FILE, state);
}

export async function getLeadBySlug(slug: string): Promise<Lead | null> {
  const data = await getCRMData();
  const found = data.leads.find((l) => l.audit_slug.toLowerCase() === slug.toLowerCase());
  return found || null;
}

export async function updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead | null> {
  const pool = getPostgresPool();
  const supabase = getSupabase();
  const state = await getCRMData();

  const idx = state.leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return null;

  const updated = { ...state.leads[idx], ...updates };
  state.leads[idx] = updated;

  await saveCRMData(state);

  // PostgreSQL Direct Update
  if (pool) {
    try {
      const keys = Object.keys(updates);
      if (keys.length > 0) {
        const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
        const values = keys.map((k) => (updates as any)[k]);
        values.push(leadId);
        await pool.query(`UPDATE leads SET ${setClauses} WHERE id = $${values.length}`, values);
      }
    } catch (pgErr) {
      console.warn("[dataBridge] PostgreSQL updateLead error:", pgErr);
    }
  } else if (supabase) {
    try {
      await supabase.from("leads").update(updates).eq("id", leadId);
    } catch (err) {
      console.warn("[dataBridge] Supabase updateLead error:", err);
    }
  }

  return updated;
}

export async function updatePlaybook(
  playbookId: string,
  updates: Partial<DirectorPlaybookStrategy>
): Promise<DirectorPlaybookStrategy | null> {
  const pool = getPostgresPool();
  const supabase = getSupabase();
  const state = await getCRMData();

  const idx = state.playbooks.findIndex((p) => p.id === playbookId);
  if (idx === -1) return null;

  const updated = { ...state.playbooks[idx], ...updates };
  state.playbooks[idx] = updated;

  await saveCRMData(state);

  // PostgreSQL Direct Update
  if (pool) {
    try {
      const keys = Object.keys(updates);
      if (keys.length > 0) {
        const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
        const values = keys.map((k) => (updates as any)[k]);
        values.push(playbookId);
        await pool.query(`UPDATE director_playbook SET ${setClauses} WHERE id = $${values.length}`, values);
      }
    } catch (pgErr) {
      console.warn("[dataBridge] PostgreSQL updatePlaybook error:", pgErr);
    }
  } else if (supabase) {
    try {
      await supabase.from("director_playbook").update(updates).eq("id", playbookId);
    } catch (err) {
      console.warn("[dataBridge] Supabase updatePlaybook error:", err);
    }
  }

  return updated;
}

export async function addInvoice(invoiceInput: Partial<Invoice>): Promise<Invoice> {
  const pool = getPostgresPool();
  const supabase = getSupabase();
  const state = await getCRMData();

  const nextNum = state.invoices.length + 1;
  const invoiceNumber = `#${String(nextNum).padStart(3, "0")}`;

  const total = Number(invoiceInput.total_amount) || 0;
  const deposit = Number(invoiceInput.deposit_amount) || total * 0.5;

  const newInvoice: Invoice = {
    id: invoiceInput.id || `inv-${Date.now()}`,
    lead_id: invoiceInput.lead_id || "lead-custom",
    business_name: invoiceInput.business_name || "Client Business",
    contact_name: invoiceInput.contact_name || "Principal",
    client_email: invoiceInput.client_email || "billing@client.com",
    client_city: invoiceInput.client_city || "Austin, TX",
    invoice_number: invoiceNumber,
    issue_date: invoiceInput.issue_date || new Date().toISOString().split("T")[0],
    due_date: invoiceInput.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    line_items: invoiceInput.line_items || [],
    total_amount: total,
    deposit_amount: deposit,
    status: invoiceInput.status || "draft",
    created_at: new Date().toISOString(),
  };

  state.invoices.unshift(newInvoice);
  await saveCRMData(state);

  // PostgreSQL Direct Insert
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO invoices (invoice_number, issue_date, due_date, line_items, total_amount, deposit_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newInvoice.invoice_number,
          newInvoice.issue_date,
          newInvoice.due_date,
          JSON.stringify(newInvoice.line_items),
          newInvoice.total_amount,
          newInvoice.deposit_amount,
          newInvoice.status,
        ]
      );
    } catch (pgErr) {
      console.warn("[dataBridge] PostgreSQL addInvoice error:", pgErr);
    }
  } else if (supabase) {
    try {
      await supabase.from("invoices").insert(newInvoice);
    } catch (err) {
      console.warn("[dataBridge] Supabase addInvoice error:", err);
    }
  }

  return newInvoice;
}
