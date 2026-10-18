"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { ViewType } from "@/components/Sidebar";
import ApprovalQueueView from "@/components/ApprovalQueueView";
import PipelineCrmView from "@/components/PipelineCrmView";
import DirectorBrainView from "@/components/DirectorBrainView";
import TemplatesInvoicesView from "@/components/TemplatesInvoicesView";
import { MOCK_LEADS, MOCK_STRATEGIES, MOCK_INVOICES } from "@/data/mockData";
import { Lead, DirectorPlaybookStrategy, Invoice } from "@/types/crm";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("approval_queue");
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [playbooks, setPlaybooks] = useState<DirectorPlaybookStrategy[]>(MOCK_STRATEGIES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch live CRM data from hybrid dataBridge on mount
  const refreshCRMData = async () => {
    try {
      const res = await fetch("/api/crm");
      if (res.ok) {
        const data = await res.json();
        if (data.leads && Array.isArray(data.leads)) setLeads(data.leads);
        if (data.playbooks && Array.isArray(data.playbooks)) setPlaybooks(data.playbooks);
        if (data.invoices && Array.isArray(data.invoices)) setInvoices(data.invoices);
      }
    } catch (err) {
      console.warn("Failed to fetch CRM data from API, using cached state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCRMData();
  }, []);

  const handleApproveLead = async (
    leadId: string,
    subject?: string,
    body?: string,
    format: "plain" | "html" = "plain"
  ) => {
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          subject,
          body,
          format,
        }),
      });
      if (res.ok) {
        await refreshCRMData();
      }
    } catch (err) {
      console.error("Error approving and dispatching lead:", err);
    }
  };

  const handleRejectLead = async (leadId: string) => {
    try {
      await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          updates: { status: "bounced" },
        }),
      });
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (err) {
      console.error("Error rejecting lead:", err);
    }
  };

  const pendingCount = leads.filter(
    (l) => l.status === "pending_approval" || l.status === "scraped_auditing"
  ).length;

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#F2F2F2] flex selection:bg-[#C8F135] selection:text-[#0C0C0C]">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        pendingCount={pendingCount}
      />

      {/* Main View Area (offset by 64 = 16rem = 256px for sidebar) */}
      <div className="ml-64 flex-1 flex flex-col min-w-0 bg-[#0C0C0C] min-h-screen">
        {activeView === "approval_queue" && (
          <ApprovalQueueView
            leads={leads}
            onApproveLead={handleApproveLead}
            onRejectLead={handleRejectLead}
            onRefreshData={refreshCRMData}
          />
        )}

        {activeView === "pipeline_crm" && (
          <PipelineCrmView
            leads={leads}
            onRefreshData={refreshCRMData}
          />
        )}

        {activeView === "director_brain" && (
          <DirectorBrainView
            strategies={playbooks}
            onRefreshData={refreshCRMData}
          />
        )}

        {activeView === "templates_invoices" && (
          <TemplatesInvoicesView
            leads={leads}
            invoices={invoices}
            onRefreshData={refreshCRMData}
          />
        )}
      </div>
    </main>
  );
}
