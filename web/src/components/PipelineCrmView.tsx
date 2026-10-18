"use client";

import React, { useState } from "react";
import { Lead } from "@/types/crm";
import { ColdCallModal } from "./ColdCallModal";
import {
  Search,
  PhoneCall,
  ExternalLink,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  MessageSquare,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

interface PipelineCrmViewProps {
  leads: Lead[];
  onRefreshData?: () => Promise<void>;
}

type FilterTab =
  | "all"
  | "no_website"
  | "crappy_website"
  | "replied_hot"
  | "replied_cold"
  | "follow_up_due"
  | "ghosted_call_required";

export const PipelineCrmView: React.FC<PipelineCrmViewProps> = ({ leads, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBattlecardLead, setSelectedBattlecardLead] = useState<Lead | null>(null);
  const [utilityStatus, setUtilityStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "ALL LEADS", count: leads.length },
    {
      id: "no_website",
      label: "NO WEBSITE",
      count: leads.filter((l) => l.target_type === "no_website").length,
    },
    {
      id: "crappy_website",
      label: "CRAPPY WEBSITE",
      count: leads.filter((l) => l.target_type === "crappy_website").length,
    },
    {
      id: "replied_hot",
      label: "REPLIED HOT",
      count: leads.filter((l) => l.status === "replied_hot").length,
    },
    {
      id: "replied_cold",
      label: "REPLIED COLD",
      count: leads.filter((l) => l.status === "replied_cold").length,
    },
    {
      id: "follow_up_due",
      label: "FOLLOW-UP DUE",
      count: leads.filter((l) => l.status === "follow_up_due").length,
    },
    {
      id: "ghosted_call_required",
      label: "GHOSTED - CALL REQUIRED",
      count: leads.filter((l) => l.status === "ghosted_call_required").length,
    },
  ];

  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "no_website" && lead.target_type !== "no_website") return false;
    if (activeTab === "crappy_website" && lead.target_type !== "crappy_website") return false;
    if (activeTab === "replied_hot" && lead.status !== "replied_hot") return false;
    if (activeTab === "replied_cold" && lead.status !== "replied_cold") return false;
    if (activeTab === "follow_up_due" && lead.status !== "follow_up_due") return false;
    if (activeTab === "ghosted_call_required" && lead.status !== "ghosted_call_required") return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const match =
        lead.business_name.toLowerCase().includes(q) ||
        (lead.contact_name && lead.contact_name.toLowerCase().includes(q)) ||
        lead.city.toLowerCase().includes(q) ||
        lead.niche.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleSimulateReply = async (isHot: boolean) => {
    setIsProcessing(true);
    try {
      const targetLead = leads.find((l) => l.status === "emailed_step_1") || leads[0];
      const replyText = isHot
        ? "Yes Saad, reviewed the audit. What is your pricing and build timeline for Wix Studio?"
        : "Unsubscribe please, not interested.";

      const res = await fetch("/api/webhooks/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: targetLead?.id,
          text: replyText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUtilityStatus(`Simulated ${data.sentiment} Reply: ${data.lead.business_name} updated!`);
        if (onRefreshData) await onRefreshData();
      }
    } catch (err: any) {
      setUtilityStatus(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUtilityStatus(null), 4000);
    }
  };

  const handleRunLifecycleCheck = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/cron/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceSimulation: true }),
      });

      const data = await res.json();
      if (data.success) {
        setUtilityStatus(
          data.transitionsCount > 0
            ? `Lifecycle Cron: ${data.transitionsCount} leads moved to follow-up / ghosted queue!`
            : "Lifecycle Cron: No pending transitions."
        );
        if (onRefreshData) await onRefreshData();
      }
    } catch (err: any) {
      setUtilityStatus(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUtilityStatus(null), 4000);
    }
  };

  const getStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "replied_hot":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#C8F135]/40 text-[#C8F135] bg-[#0C0C0C] text-[9px] font-mono rounded-[2px]">
            <Flame size={10} /> REPLIED HOT
          </span>
        );
      case "ghosted_call_required":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#888888] text-[#F2F2F2] bg-[#111111] text-[9px] font-mono rounded-[2px]">
            <PhoneCall size={10} className="text-[#C8F135]" /> GHOSTED // CALL
          </span>
        );
      case "follow_up_due":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#3A3A3A] text-[#888888] bg-[#0C0C0C] text-[9px] font-mono rounded-[2px]">
            <Clock size={10} /> FOLLOW-UP DUE
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#2A2A2A] text-[#888888] bg-[#0C0C0C] text-[9px] font-mono rounded-[2px]">
            PENDING APPROVAL
          </span>
        );
      case "emailed_step_1":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#1A1A1A] text-[#888888] bg-[#0C0C0C] text-[9px] font-mono rounded-[2px]">
            <CheckCircle2 size={10} /> EMAILED STEP 1
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 border border-[#1A1A1A] text-[#3A3A3A] text-[9px] font-mono rounded-[2px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2px)] overflow-hidden bg-[#0C0C0C] p-6 space-y-5">
      {/* Top Header & Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
        <div>
          <div className="font-microlabel">PIPELINE CRM // AUDITED LEAD ENGAGEMENT</div>
          <h2 className="font-display text-2xl text-[#F2F2F2] tracking-[0.005em] mt-0.5">
            HIGH-TICKET OUTBOUND PIPELINE
          </h2>
        </div>

        {/* Action Utilities: Reply simulation & Lifecycle Cron */}
        <div className="flex flex-wrap items-center gap-2">
          {utilityStatus && (
            <span className="text-[11px] font-mono text-[#C8F135] animate-pulse mr-2">
              {utilityStatus}
            </span>
          )}

          <div className="flex items-center gap-1 bg-[#111111] p-1 border border-[#1A1A1A] rounded-[2px]">
            <button
              onClick={() => handleSimulateReply(true)}
              disabled={isProcessing}
              className="px-2.5 py-1 text-[11px] font-display uppercase tracking-wider text-[#C8F135] hover:bg-[#0C0C0C] rounded-[2px] transition-colors"
              title="Simulate prospect replying with high buying interest"
            >
              + SIMULATE HOT
            </button>
            <button
              onClick={() => handleSimulateReply(false)}
              disabled={isProcessing}
              className="px-2.5 py-1 text-[11px] font-display uppercase tracking-wider text-[#888888] hover:bg-[#0C0C0C] rounded-[2px] transition-colors"
              title="Simulate prospect replying with cold/unsubscribe"
            >
              SIMULATE COLD
            </button>
          </div>

          <button
            onClick={handleRunLifecycleCheck}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-[#111111] hover:bg-[#1A1A1A] border border-[#1A1A1A] text-[11px] font-display uppercase tracking-wider text-[#F2F2F2] rounded-[2px] flex items-center gap-1.5 transition-colors"
          >
            <Clock size={12} />
            <span>RUN LIFECYCLE CRON</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A] pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-[2px] transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-[#111111] text-[#F2F2F2] border-b-2 border-b-[#C8F135]"
                    : "text-[#888888] hover:text-[#F2F2F2] hover:bg-[#111111]/40"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 border ${
                    isActive
                      ? "border-[#3A3A3A] text-[#F2F2F2] bg-[#0C0C0C]"
                      : "border-[#1A1A1A] text-[#888888]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-[#888888]" />
          <input
            type="text"
            placeholder="Search leads, city, niche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-[#1A1A1A] focus:border-[#3A3A3A] pl-9 pr-3 py-1.5 text-xs text-[#F2F2F2] rounded-[2px] outline-none font-body"
          />
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="flex-1 bg-[#111111] border border-[#1A1A1A] rounded-[2px] overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0C0C0C] border-b border-[#1A1A1A] font-microlabel sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">BUSINESS & CONTACT</th>
                <th className="py-3 px-4">TARGET TYPE</th>
                <th className="py-3 px-4">LOCATION & NICHE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">SCORE / RATINGS</th>
                <th className="py-3 px-4">LIVE AUDIT</th>
                <th className="py-3 px-4 text-right">TACTICAL ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A] font-body">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#888888]">
                    No leads found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#0C0C0C]/50 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-display text-sm text-[#F2F2F2] tracking-[0.005em]">
                        {lead.business_name}
                      </div>
                      <div className="text-[11px] text-[#888888] mt-0.5">
                        {lead.contact_name || "Direct Decision Maker"} • {lead.email || "No email"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-microlabel px-2 py-0.5 border ${
                          lead.target_type === "no_website"
                            ? "border-[#2A2A2A] text-[#888888] bg-[#0C0C0C]"
                            : "border-[#3A3A3A] text-[#F2F2F2] bg-[#0C0C0C]"
                        }`}
                      >
                        {lead.target_type === "no_website" ? "NO WEBSITE" : "CRAPPY WEB"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#888888]">
                      <div className="text-[#F2F2F2]">{lead.city}</div>
                      <div className="text-[11px] text-[#888888]">{lead.niche}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      {lead.target_type === "crappy_website" ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[#F2F2F2]">{lead.website_score || 34}</span>
                          <span className="text-[#3A3A3A]">/100</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#888888]">
                          {lead.rating}★ ({lead.review_count})
                        </div>
                      )}
                    </td>

                    {/* Live Audit Portal Link */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <a
                        href={`/audit/${lead.audit_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#888888] hover:text-[#F2F2F2] inline-flex items-center gap-1 group-hover:text-[#C8F135]"
                      >
                        <span>/{lead.audit_slug}</span>
                        <ArrowUpRight size={12} />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {lead.call_battlecard ? (
                        <button
                          onClick={() => setSelectedBattlecardLead(lead)}
                          className="px-2.5 py-1.5 bg-[#0C0C0C] hover:bg-[#1A1A1A] border border-[#1A1A1A] hover:border-[#3A3A3A] text-xs font-display uppercase tracking-wider text-[#F2F2F2] rounded-[2px] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <PhoneCall size={12} className="text-[#C8F135]" />
                          <span>BATTLECARD</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#3A3A3A]">READY</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cold Call Battlecard Modal */}
      <ColdCallModal
        lead={selectedBattlecardLead}
        onClose={() => setSelectedBattlecardLead(null)}
      />
    </div>
  );
};

export default PipelineCrmView;
