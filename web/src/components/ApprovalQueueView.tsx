"use client";

import React, { useState } from "react";
import { Lead } from "@/types/crm";
import {
  Check,
  AlertTriangle,
  Globe,
  Star,
  ExternalLink,
  Send,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Play,
  Layers,
  Search,
  Compass
} from "lucide-react";

interface ApprovalQueueViewProps {
  leads: Lead[];
  onApproveLead: (leadId: string, subject?: string, body?: string, format?: "plain" | "html") => Promise<void>;
  onRejectLead: (leadId: string) => void;
  onRefreshData?: () => Promise<void>;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({
  leads,
  onApproveLead,
  onRejectLead,
  onRefreshData,
}) => {
  const pendingLeads = leads.filter(
    (l) => l.status === "pending_approval" || l.status === "scraped_auditing"
  );
  const displayLeads = pendingLeads.length > 0 ? pendingLeads : leads;

  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    displayLeads[0]?.id || ""
  );
  const [emailTab, setEmailTab] = useState<"plain" | "html">("plain");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentMessageId, setSentMessageId] = useState<string | null>(null);

  // Scraper Launch Bar State
  const [showScraperBar, setShowScraperBar] = useState(false);
  const [scraperMode, setScraperMode] = useState<"maps" | "url">("maps");
  const [scrapeNiche, setScrapeNiche] = useState("Commercial Roofing");
  const [scrapeCity, setScrapeCity] = useState("Austin, TX");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeName, setScrapeName] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scraperStatus, setScraperStatus] = useState<string | null>(null);

  const selectedLead = displayLeads.find((l) => l.id === selectedLeadId) || displayLeads[0];

  React.useEffect(() => {
    if (selectedLead) {
      setEmailSubject(selectedLead.email_subject || "");
      setEmailBody(selectedLead.email_draft_plain || "");
      if (selectedLead.status === "emailed_step_1") {
        setSentMessageId(selectedLead.outbound_message_id || "dispatched");
      } else {
        setSentMessageId(null);
      }
    }
  }, [selectedLead]);

  const handleSend = async () => {
    if (!selectedLead || isSending) return;
    setIsSending(true);
    try {
      await onApproveLead(selectedLead.id, emailSubject, emailBody, emailTab);
      setSentMessageId("dispatched");
    } finally {
      setIsSending(false);
    }
  };

  const handleRunScraper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    setScraperStatus("Scraper running Playwright automation...");

    try {
      const payload =
        scraperMode === "maps"
          ? { mode: "scrape", niche: scrapeNiche, city: scrapeCity, limit: 3 }
          : { mode: "audit_url", url: scrapeUrl, name: scrapeName || "Target Business" };

      const res = await fetch("/api/scraper/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setScraperStatus("Audit & synthesis complete! Leads updated.");
        if (onRefreshData) await onRefreshData();
      } else {
        setScraperStatus(`Error: ${data.stderr || "Scraper execution failed"}`);
      }
    } catch (err: any) {
      setScraperStatus(`Execution error: ${err.message}`);
    } finally {
      setIsScraping(false);
      setTimeout(() => setScraperStatus(null), 4000);
    }
  };

  if (!selectedLead) {
    return (
      <div className="p-8 text-center bg-[#111111] border border-[#1A1A1A] rounded-[2px] m-6">
        <p className="font-display text-lg text-[#F2F2F2]">APPROVAL QUEUE IS EMPTY</p>
        <p className="text-xs text-[#888888] font-body mt-2">
          Use the launch bar to scrape fresh prospects or audit a website.
        </p>
        <button
          onClick={() => setShowScraperBar(true)}
          className="mt-4 px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-display text-[#F2F2F2] rounded-[2px]"
        >
          OPEN SCRAPER TOOLBAR
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2px)] overflow-hidden">
      {/* Interactive Scraper / Audit Toolbar */}
      <div className="bg-[#111111] border-b border-[#1A1A1A] px-6 py-2.5 flex items-center justify-between text-xs font-body">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScraperBar(!showScraperBar)}
            className={`px-3 py-1 text-xs font-display tracking-wider rounded-[2px] border transition-colors flex items-center gap-1.5 ${
              showScraperBar
                ? "bg-[#0C0C0C] text-[#F2F2F2] border-[#3A3A3A]"
                : "border-[#1A1A1A] text-[#888888] hover:text-[#F2F2F2]"
            }`}
          >
            <Compass size={13} />
            <span>LAUNCH SCRAPER / AUDIT TARGET</span>
          </button>

          {scraperStatus && (
            <span className="text-[11px] font-mono text-[#C8F135] animate-pulse">
              {scraperStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[#888888] text-[11px]">
          <span>
            Pending Approval: <strong className="text-[#F2F2F2]">{pendingLeads.length}</strong>
          </span>
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="text-[#888888] hover:text-[#F2F2F2] transition-colors"
              title="Refresh leads from disk & Supabase"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Scraper Control Bar */}
      {showScraperBar && (
        <form
          onSubmit={handleRunScraper}
          className="bg-[#0C0C0C] border-b border-[#1A1A1A] p-4 flex flex-wrap items-center gap-3 animate-fadeIn text-xs"
        >
          <div className="flex items-center gap-1 bg-[#111111] p-1 border border-[#1A1A1A] rounded-[2px]">
            <button
              type="button"
              onClick={() => setScraperMode("maps")}
              className={`px-2.5 py-1 text-[11px] font-display rounded-[2px] ${
                scraperMode === "maps" ? "bg-[#1A1A1A] text-[#F2F2F2]" : "text-[#888888]"
              }`}
            >
              MAPS BATCH
            </button>
            <button
              type="button"
              onClick={() => setScraperMode("url")}
              className={`px-2.5 py-1 text-[11px] font-display rounded-[2px] ${
                scraperMode === "url" ? "bg-[#1A1A1A] text-[#F2F2F2]" : "text-[#888888]"
              }`}
            >
              INSTANT URL AUDIT
            </button>
          </div>

          {scraperMode === "maps" ? (
            <>
              <input
                type="text"
                placeholder="Niche (e.g. Commercial Roofing)"
                value={scrapeNiche}
                onChange={(e) => setScrapeNiche(e.target.value)}
                className="bg-[#111111] border border-[#1A1A1A] px-3 py-1.5 text-[#F2F2F2] rounded-[2px] outline-none w-52"
              />
              <input
                type="text"
                placeholder="City (e.g. Austin, TX)"
                value={scrapeCity}
                onChange={(e) => setScrapeCity(e.target.value)}
                className="bg-[#111111] border border-[#1A1A1A] px-3 py-1.5 text-[#F2F2F2] rounded-[2px] outline-none w-44"
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="https://client-site.com"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                className="bg-[#111111] border border-[#1A1A1A] px-3 py-1.5 text-[#F2F2F2] rounded-[2px] outline-none flex-1 min-w-[200px]"
              />
              <input
                type="text"
                placeholder="Business Name"
                value={scrapeName}
                onChange={(e) => setScrapeName(e.target.value)}
                className="bg-[#111111] border border-[#1A1A1A] px-3 py-1.5 text-[#F2F2F2] rounded-[2px] outline-none w-48"
              />
            </>
          )}

          <button
            type="submit"
            disabled={isScraping}
            className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] text-xs font-display uppercase tracking-wider text-[#F2F2F2] rounded-[2px] flex items-center gap-1.5 disabled:opacity-50"
          >
            {isScraping ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
            <span>{isScraping ? "RUNNING..." : "START AUDIT"}</span>
          </button>
        </form>
      )}

      {/* Split-pane Lead Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Queue List */}
        <div className="w-80 border-r border-[#1A1A1A] bg-[#0C0C0C] flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
            <div>
              <div className="font-microlabel">QUEUE // PENDING VERIFICATION</div>
              <div className="font-display text-lg text-[#F2F2F2] mt-0.5">
                LEAD BATCH ({displayLeads.length})
              </div>
            </div>
            <span className="px-2 py-0.5 bg-[#111111] border border-[#1A1A1A] text-[10px] font-mono text-[#888888]">
              READY
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#1A1A1A]">
            {displayLeads.map((lead) => {
              const isSelected = lead.id === selectedLead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-4 cursor-pointer transition-colors relative ${
                    isSelected
                      ? "bg-[#111111] border-l-2 border-l-[#C8F135]"
                      : "hover:bg-[#111111]/50 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`font-microlabel text-[8px] px-1.5 py-0.5 border ${
                        lead.target_type === "no_website"
                          ? "border-[#2A2A2A] text-[#888888] bg-[#0C0C0C]"
                          : "border-[#3A3A3A] text-[#F2F2F2] bg-[#0C0C0C]"
                      }`}
                    >
                      {lead.target_type === "no_website" ? "NO WEBSITE" : "CRAPPY WEB"}
                    </span>

                    {lead.rating && (
                      <div className="flex items-center gap-1 text-[11px] text-[#888888]">
                        <Star size={10} className="text-[#888888] fill-[#888888]" />
                        <span>{lead.rating}</span>
                        <span className="text-[#3A3A3A]">({lead.review_count})</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-[15px] text-[#F2F2F2] tracking-[0.005em] leading-snug">
                    {lead.business_name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-xs text-[#888888] font-body">
                    <span>{lead.contact_name || "Direct Owner"}</span>
                    <span>•</span>
                    <span>{lead.city}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-[#3A3A3A] truncate font-mono">
                    /{lead.audit_slug}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Detail View */}
        <div className="flex-1 overflow-y-auto bg-[#0C0C0C] p-6 space-y-6">
          {/* Lead Top Bar */}
          <div className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-microlabel">TARGET PROFILE</span>
                <span className="text-[#3A3A3A]">•</span>
                <span className="font-microlabel text-[#888888]">{selectedLead.niche}</span>
                <span className="text-[#3A3A3A]">•</span>
                <span className="font-microlabel text-[#888888]">{selectedLead.city}</span>
              </div>
              <h2 className="font-display text-3xl text-[#F2F2F2] tracking-[0.005em]">
                {selectedLead.business_name}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-xs text-[#888888] font-body">
                <span>
                  Contact:{" "}
                  <strong className="text-[#F2F2F2]">
                    {selectedLead.contact_name || "Owner"}
                  </strong>
                </span>
                <span>
                  Email:{" "}
                  <strong className="text-[#F2F2F2]">
                    {selectedLead.email || "No email"}
                  </strong>
                </span>
                <span>
                  Phone:{" "}
                  <strong className="text-[#F2F2F2]">
                    {selectedLead.phone || "N/A"}
                  </strong>
                </span>
              </div>
            </div>

            {/* LIVE AUDIT PAGE LINK */}
            <div className="flex flex-col items-end gap-2">
              <a
                href={`/audit/${selectedLead.audit_slug}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#0C0C0C] hover:bg-[#1A1A1A] border border-[#1A1A1A] hover:border-[#3A3A3A] text-xs font-display tracking-wider text-[#F2F2F2] flex items-center gap-1.5 transition-colors rounded-[2px]"
              >
                <span>OPEN LIVE AUDIT PAGE</span>
                <ArrowUpRight size={13} className="text-[#C8F135]" />
              </a>

              {selectedLead.top_competitor && (
                <div className="text-[11px] text-[#888888]">
                  Benchmark: <span className="text-[#F2F2F2]">{selectedLead.top_competitor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Website Audit Scorecard */}
          <div className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#888888]" />
                <span className="font-display text-sm tracking-[0.005em] text-[#F2F2F2]">
                  WEBSITE AUDIT SCORECARD & BENCHMARK
                </span>
              </div>
              <span className="font-microlabel">VISION ENGINE V2</span>
            </div>

            {selectedLead.target_type === "crappy_website" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px]">
                  <div className="font-microlabel">AUDIT HEALTH SCORE</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-4xl text-[#F2F2F2]">
                      {selectedLead.website_score || 34}
                    </span>
                    <span className="font-display text-sm text-[#888888]">/ 100</span>
                  </div>
                  <div className="mt-3 w-full bg-[#1A1A1A] h-1.5 overflow-hidden">
                    <div
                      className="bg-[#C8F135] h-full"
                      style={{ width: `${selectedLead.website_score || 34}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-[#888888] font-body">
                    Conversion leaks flagged on mobile layout.
                  </div>
                </div>

                <div className="p-4 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px]">
                  <div className="font-microlabel">SCREENSHOT CAPTURE</div>
                  <div className="mt-2 text-xs font-mono text-[#F2F2F2] truncate">
                    {selectedLead.website_url || "Direct Audit"}
                  </div>
                  <div className="mt-2 text-[11px] text-[#888888]">
                    {selectedLead.website_screenshot_url ? (
                      <span className="text-[#C8F135] font-mono">
                        Saved in /public{selectedLead.website_screenshot_url}
                      </span>
                    ) : (
                      "Snapshot pending"
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px]">
                  <div className="font-microlabel">MARKET DEFICIT</div>
                  <div className="mt-2 text-xs text-[#F2F2F2] font-body leading-relaxed">
                    High-ticket inquiries escaping to{" "}
                    <strong className="text-[#F2F2F2]">{selectedLead.top_competitor}</strong> due
                    to friction in appointment intake.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-[#888888]" />
                  <span className="font-display text-sm text-[#F2F2F2]">
                    ZERO DIGITAL FOOTPRINT DETECTED
                  </span>
                </div>
                <p className="text-xs text-[#888888] font-body leading-relaxed">
                  {selectedLead.business_name} commands strong reputation (
                  {selectedLead.review_count || 50} Google Reviews, {selectedLead.rating || 4.9}★)
                  but lacks an owned digital conversion portal. 100% of organic search volume
                  bounces to competitors with instant bid intake forms.
                </p>
              </div>
            )}
          </div>

          {/* AI Client Brief & Pain Points */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] mb-4">
                  <span className="font-display text-sm text-[#F2F2F2]">AI CLIENT BRIEF</span>
                  <span className="font-microlabel">SYNTHESIZED INTEL</span>
                </div>

                <div className="space-y-3.5 text-xs font-body">
                  <div>
                    <div className="font-microlabel text-[#888888] mb-1">BUSINESS SUMMARY</div>
                    <p className="text-[#F2F2F2] leading-relaxed">
                      {selectedLead.client_brief.business_summary}
                    </p>
                  </div>

                  <div>
                    <div className="font-microlabel text-[#888888] mb-1">WORKING MODEL</div>
                    <p className="text-[#888888] leading-relaxed">
                      {selectedLead.client_brief.working_model}
                    </p>
                  </div>

                  <div>
                    <div className="font-microlabel text-[#888888] mb-1">STRATEGIC PITCH ANGLE</div>
                    <p className="text-[#F2F2F2] leading-relaxed">
                      {selectedLead.client_brief.pitch_angle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1A1A1A]">
                <div className="font-microlabel text-[#888888] mb-2">
                  RECOMMENDED BYSAAD SERVICES
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.client_brief.recommended_services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#0C0C0C] border border-[#1A1A1A] text-[10px] text-[#888888] font-mono rounded-[2px]"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pain Points */}
            <div className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] mb-4">
                <span className="font-display text-sm text-[#F2F2F2]">
                  IDENTIFIED OPERATIONAL FLAWS ({selectedLead.pain_points.length})
                </span>
                <span className="font-microlabel">FIELD AUDIT</span>
              </div>

              <div className="space-y-3">
                {selectedLead.pain_points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] flex items-start gap-3"
                  >
                    <span className="font-mono text-xs text-[#888888] mt-0.5">0{idx + 1}</span>
                    <p className="text-xs font-body text-[#F2F2F2] leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editable Email Template Preview */}
          <div className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
              <div>
                <span className="font-display text-sm text-[#F2F2F2]">
                  OUTBOUND EMAIL DISPATCH
                </span>
                <span className="text-xs text-[#888888] font-body ml-2">
                  (Personalized & Locked to Saad Bin Faisal Tone)
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#0C0C0C] p-1 border border-[#1A1A1A] rounded-[2px]">
                <button
                  onClick={() => setEmailTab("plain")}
                  className={`px-3 py-1 text-xs font-display tracking-wider rounded-[2px] transition-colors ${
                    emailTab === "plain"
                      ? "bg-[#1A1A1A] text-[#F2F2F2]"
                      : "text-[#888888] hover:text-[#F2F2F2]"
                  }`}
                >
                  PLAIN-TEXT
                </button>
                <button
                  onClick={() => setEmailTab("html")}
                  className={`px-3 py-1 text-xs font-display tracking-wider rounded-[2px] transition-colors ${
                    emailTab === "html"
                      ? "bg-[#1A1A1A] text-[#F2F2F2]"
                      : "text-[#888888] hover:text-[#F2F2F2]"
                  }`}
                >
                  BYSAAD DARK HTML
                </button>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="font-microlabel block mb-1.5">SUBJECT LINE</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-[#0C0C0C] border border-[#1A1A1A] focus:border-[#3A3A3A] px-3 py-2 text-sm text-[#F2F2F2] rounded-[2px] outline-none font-body"
              />
            </div>

            {/* Body Preview / Editor */}
            {emailTab === "plain" ? (
              <div>
                <label className="font-microlabel block mb-1.5">
                  DELIVERABILITY BODY (PLAIN-TEXT)
                </label>
                <textarea
                  rows={9}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[#0C0C0C] border border-[#1A1A1A] focus:border-[#3A3A3A] p-3 text-sm text-[#F2F2F2] rounded-[2px] outline-none font-mono leading-relaxed resize-y"
                />
              </div>
            ) : (
              <div>
                <label className="font-microlabel block mb-1.5">
                  BYSAAD DARK-THEMED HTML PREVIEW
                </label>
                <div
                  className="p-4 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html: selectedLead.email_draft_html || "<p>No HTML draft available</p>",
                  }}
                />
              </div>
            )}

            {/* Follow-up Peek */}
            {selectedLead.follow_up_draft && (
              <div className="p-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px]">
                <span className="font-microlabel text-[#888888] block mb-1">
                  SCHEDULED FOLLOW-UP (STEP 2 // 72H DELAY)
                </span>
                <p className="text-xs text-[#888888] font-body italic">
                  &quot;{selectedLead.follow_up_draft}&quot;
                </p>
              </div>
            )}

            {/* Action Bar — SINGLE LIME ENFORCEMENT */}
            <div className="pt-4 border-t border-[#1A1A1A] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onRejectLead(selectedLead.id)}
                  className="px-4 py-2.5 border border-[#1A1A1A] hover:border-[#3A3A3A] text-xs font-display uppercase tracking-wider text-[#888888] hover:text-[#F2F2F2] rounded-[2px] transition-colors"
                >
                  REJECT LEAD
                </button>
              </div>

              {/* SINGLE LIME PRIMARY CTA */}
              <button
                onClick={handleSend}
                disabled={isSending || Boolean(sentMessageId)}
                className={`px-6 py-2.5 font-display text-sm uppercase tracking-wider rounded-[2px] flex items-center gap-2 transition-colors ${
                  sentMessageId
                    ? "bg-[#111111] text-[#888888] border border-[#1A1A1A] cursor-not-allowed"
                    : isSending
                    ? "bg-[#C8F135]/60 text-[#0C0C0C] cursor-wait"
                    : "bg-[#C8F135] hover:bg-[#b8e125] text-[#0C0C0C] font-semibold cursor-pointer"
                }`}
              >
                {sentMessageId ? (
                  <>
                    <Check size={16} />
                    <span>APPROVED & DISPATCHED</span>
                  </>
                ) : isSending ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>DISPATCHING...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>APPROVE & SEND</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalQueueView;
