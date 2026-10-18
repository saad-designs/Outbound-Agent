"use client";

import React, { useState } from "react";
import SMark from "./SMark";
import { Invoice, InvoiceLineItem, Lead } from "@/types/crm";
import {
  FileText,
  Mail,
  Printer,
  Copy,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Save
} from "lucide-react";

interface TemplatesInvoicesViewProps {
  leads: Lead[];
  invoices: Invoice[];
  onRefreshData?: () => Promise<void>;
}

export const TemplatesInvoicesView: React.FC<TemplatesInvoicesViewProps> = ({
  leads,
  invoices,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<"invoice" | "email_template">("invoice");

  // Invoice State
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || "");
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `#${String(invoices.length + 1).padStart(3, "0")}`
  );
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: "1",
      service: "Full Website Build in Wix Studio",
      description: "Custom commercial portal, mobile optimization, conversion funnel, CMS collections, and on-page SEO setup.",
      amount: 3200,
    },
    {
      id: "2",
      service: "Multi-Step Intake Form & Estimator",
      description: "Interactive project calculator with automated routing, client notification triggers, and CRM sync.",
      amount: 1400,
    },
    {
      id: "3",
      service: "Brand Identity & Type System",
      description: "Precision typography standards, color tokens, vector asset package, and locked usage guidelines.",
      amount: 900,
    },
  ]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const totalAmount = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const depositAmount = totalAmount * 0.5;

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: String(Date.now()),
        service: "Custom Conversion Workflow",
        description: "Multi-step client intake and automated SMS/email bridge.",
        amount: 800,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleSaveInvoice = async () => {
    setIsSaving(true);
    setSaveStatus("Saving invoice...");
    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: selectedLead?.id,
          business_name: selectedLead?.business_name,
          contact_name: selectedLead?.contact_name || "Principal",
          client_email: selectedLead?.email || "billing@client.com",
          client_city: selectedLead?.city || "Austin, TX",
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          due_date: dueDate,
          line_items: lineItems,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus(`Invoice ${data.invoice.invoice_number} saved to database!`);
        if (onRefreshData) await onRefreshData();
      }
    } catch (err: any) {
      setSaveStatus(`Error saving invoice: ${err.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2px)] overflow-y-auto bg-[#0C0C0C] p-6 space-y-6">
      {/* Top Header & Tab Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
        <div>
          <div className="font-microlabel">ASSETS & BILLING // BYSAAD STANDARDS</div>
          <h2 className="font-display text-2xl text-[#F2F2F2] tracking-[0.005em] mt-0.5">
            TEMPLATES & INVOICE ENGINE
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-[#111111] p-1 border border-[#1A1A1A] rounded-[2px]">
          <button
            onClick={() => setActiveTab("invoice")}
            className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-[2px] transition-colors flex items-center gap-1.5 ${
              activeTab === "invoice"
                ? "bg-[#0C0C0C] text-[#F2F2F2] border-b-2 border-b-[#C8F135]"
                : "text-[#888888] hover:text-[#F2F2F2]"
            }`}
          >
            <FileText size={14} />
            <span>BYSAAD INVOICE SPEC</span>
          </button>
          <button
            onClick={() => setActiveTab("email_template")}
            className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-[2px] transition-colors flex items-center gap-1.5 ${
              activeTab === "email_template"
                ? "bg-[#0C0C0C] text-[#F2F2F2] border-b-2 border-b-[#C8F135]"
                : "text-[#888888] hover:text-[#F2F2F2]"
            }`}
          >
            <Mail size={14} />
            <span>DARK EMAIL TEMPLATE</span>
          </button>
        </div>
      </div>

      {activeTab === "invoice" ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-body">
              <div>
                <label className="font-microlabel block mb-1">SELECT LEAD RECIPIENT</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="bg-[#0C0C0C] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#F2F2F2] rounded-[2px] outline-none"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.business_name} ({l.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-microlabel block mb-1">INVOICE NUMBER</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="bg-[#0C0C0C] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#F2F2F2] rounded-[2px] outline-none font-mono w-24"
                />
              </div>

              <div>
                <label className="font-microlabel block mb-1">DUE DATE</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-[#0C0C0C] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#F2F2F2] rounded-[2px] outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saveStatus && (
                <span className="text-[11px] font-mono text-[#C8F135] mr-2">
                  {saveStatus}
                </span>
              )}

              <button
                onClick={handleAddLineItem}
                className="px-3 py-2 bg-[#0C0C0C] hover:bg-[#1A1A1A] border border-[#1A1A1A] hover:border-[#3A3A3A] text-xs font-display uppercase tracking-wider text-[#F2F2F2] rounded-[2px] flex items-center gap-1.5 transition-colors"
              >
                <Plus size={13} />
                <span>ADD LINE ITEM</span>
              </button>

              <button
                onClick={handleSaveInvoice}
                disabled={isSaving}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] text-xs font-display uppercase tracking-wider text-[#F2F2F2] rounded-[2px] flex items-center gap-1.5 transition-colors"
              >
                <Save size={13} />
                <span>{isSaving ? "SAVING..." : "SAVE INVOICE"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] text-xs font-display uppercase tracking-wider text-[#F2F2F2] rounded-[2px] flex items-center gap-1.5 transition-colors"
              >
                <Printer size={13} />
                <span>PRINT / EXPORT</span>
              </button>
            </div>
          </div>

          {/* THE LOCKED BYSAAD INVOICE DOCUMENT */}
          <div className="p-10 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] max-w-4xl mx-auto space-y-10 text-[#F2F2F2]">
            {/* Top Brand & Invoice Header */}
            <div className="flex items-start justify-between pb-8 border-b border-[#1A1A1A]">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SMark size={42} />
                  <div>
                    <div className="font-display text-lg text-[#F2F2F2] tracking-[0.005em]">
                      SAAD BIN FAISAL
                    </div>
                    <div className="font-wordmark text-xs text-[#888888] tracking-[0.04em]">
                      BYSAAD
                    </div>
                  </div>
                </div>

                <div className="text-xs font-body text-[#888888] space-y-0.5">
                  <p>Lahore, Punjab, Pakistan</p>
                  <p>hello@bysaad.com</p>
                  <p className="font-mono text-[#F2F2F2]">bysaad.com</p>
                </div>
              </div>

              {/* Locked INVOICE Oswald Accent Heading */}
              <div className="text-right">
                <h1 className="font-display text-5xl text-[#C8F135] tracking-[0.005em]">
                  INVOICE
                </h1>
                <div className="mt-2 space-y-1 text-xs font-mono">
                  <p className="text-[#F2F2F2]">
                    <span className="text-[#888888]">NUMBER:</span> {invoiceNumber}
                  </p>
                  <p className="text-[#888888]">
                    <span>ISSUE DATE:</span> {issueDate}
                  </p>
                  <p className="text-[#888888]">
                    <span>DUE DATE:</span> {dueDate} (NET 14)
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-8 text-xs font-body">
              <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
                <div className="font-microlabel text-[#888888] mb-2">BILLED TO (CLIENT)</div>
                <div className="font-display text-base text-[#F2F2F2]">
                  {selectedLead ? selectedLead.business_name : "Apex Roofing & Solar"}
                </div>
                <div className="text-[#888888] mt-1 space-y-0.5">
                  <p>Attn: {selectedLead?.contact_name || "Principal / Owner"}</p>
                  <p>{selectedLead?.city || "Austin, TX"}</p>
                  <p className="font-mono">{selectedLead?.email || "billing@client.com"}</p>
                </div>
              </div>

              <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px] flex flex-col justify-between">
                <div>
                  <div className="font-microlabel text-[#888888] mb-1">ENGAGEMENT SPECIFICATION</div>
                  <div className="text-[#F2F2F2] leading-relaxed">
                    Custom Web Conversion Architecture, High-Ticket Funnel Build & Local SEO Engine.
                  </div>
                </div>
                <div className="font-microlabel text-[#C8F135] mt-2">
                  50% UPFRONT KICKOFF TERMS
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-[#1A1A1A] rounded-[2px] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] border-b border-[#1A1A1A] font-microlabel">
                  <tr>
                    <th className="py-3 px-4">ITEM / SERVICE DESCRIPTION</th>
                    <th className="py-3 px-4 text-right w-32">AMOUNT (USD)</th>
                    <th className="py-3 px-4 text-center w-12 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] font-body bg-[#0C0C0C]">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-3.5 px-4 space-y-1">
                        <input
                          type="text"
                          value={item.service}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx].service = e.target.value;
                            setLineItems(updated);
                          }}
                          className="w-full bg-transparent text-sm font-semibold text-[#F2F2F2] outline-none font-display"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx].description = e.target.value;
                            setLineItems(updated);
                          }}
                          className="w-full bg-transparent text-xs text-[#888888] outline-none font-body"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-[#F2F2F2]">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx].amount = Number(e.target.value) || 0;
                            setLineItems(updated);
                          }}
                          className="w-24 bg-transparent text-right text-sm font-mono text-[#F2F2F2] outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center print:hidden">
                        <button
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-[#3A3A3A] hover:text-[#888888] transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Deposit Terms */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
              <div className="max-w-md space-y-3 text-xs font-body">
                <div className="font-microlabel text-[#888888]">PAYMENT TERMS & WIRE PROTOCOL</div>
                <p className="text-[#888888] leading-relaxed">
                  50% deposit (${depositAmount.toLocaleString()}) required prior to project sprint kickoff. Balance due upon delivery of final staging portal. Payable via Wire Transfer, Wise, or Payoneer.
                </p>
                <div className="p-3 bg-[#111111] border border-[#1A1A1A] rounded-[2px] font-mono text-[11px] text-[#888888] space-y-0.5">
                  <p>Bank Wire / Wise ID: <span className="text-[#F2F2F2]">saad@bysaad.com</span></p>
                  <p>Reference: <span className="text-[#F2F2F2]">{invoiceNumber} - {selectedLead?.business_name}</span></p>
                </div>
              </div>

              <div className="w-full md:w-72 p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px] space-y-2.5">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-[#888888]">Subtotal:</span>
                  <span className="font-mono text-[#F2F2F2]">${totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-[#888888]">Tax (0% Export):</span>
                  <span className="font-mono text-[#F2F2F2]">$0.00</span>
                </div>
                <div className="pt-2 border-t border-[#1A1A1A] flex justify-between items-baseline">
                  <span className="font-display text-sm text-[#F2F2F2]">TOTAL AMOUNT:</span>
                  <span className="font-display text-xl text-[#F2F2F2]">${totalAmount.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] mt-2 flex justify-between items-baseline">
                  <span className="font-microlabel text-[#C8F135]">DEPOSIT DUE (50%):</span>
                  <span className="font-display text-2xl text-[#C8F135]">
                    ${depositAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t border-[#1A1A1A] flex justify-between items-end text-xs text-[#888888] font-body">
              <div>
                <p className="font-display text-sm text-[#F2F2F2]">Saad Bin Faisal</p>
                <p>Founder & Principal Architect, BYSAAD</p>
              </div>
              <div className="font-microlabel text-[#3A3A3A]">
                AUTHENTICATED BYSAAD INVOICE SPEC
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dark Email Template Preview */
        <div className="space-y-6">
          <div className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
            <div className="font-microlabel mb-1">BYSAAD DESIGN SYSTEM SPECIFICATION</div>
            <h3 className="font-display text-lg text-[#F2F2F2]">
              LOCKED DARK-THEMED OUTBOUND HTML EMAIL
            </h3>
            <p className="text-xs text-[#888888] font-body mt-1">
              Engineered with inline CSS, table structures, and zero scripts for 99.4% inbox deliverability across Gmail, Outlook, and Apple Mail.
            </p>
          </div>

          <div className="max-w-2xl mx-auto p-6 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px]">
            <div
              dangerouslySetInnerHTML={{
                __html: selectedLead?.email_draft_html || "<p>Loading template...</p>",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesInvoicesView;
