import React from "react";
import SMark from "./SMark";
import { CheckSquare, LayoutGrid, BrainCircuit, FileSpreadsheet, ShieldCheck } from "lucide-react";

export type ViewType = "approval_queue" | "pipeline_crm" | "director_brain" | "templates_invoices";

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  pendingCount = 2,
}) => {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "approval_queue",
      label: "APPROVAL QUEUE",
      icon: <CheckSquare size={16} />,
      badge: pendingCount,
    },
    {
      id: "pipeline_crm",
      label: "PIPELINE CRM",
      icon: <LayoutGrid size={16} />,
    },
    {
      id: "director_brain",
      label: "DIRECTOR BRAIN",
      icon: <BrainCircuit size={16} />,
    },
    {
      id: "templates_invoices",
      label: "TEMPLATES & INVOICES",
      icon: <FileSpreadsheet size={16} />,
    },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0C0C0C] border-r border-[#1A1A1A] flex flex-col justify-between select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#1A1A1A] flex items-center gap-3.5">
          <SMark size={38} />
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-[15px] text-[#F2F2F2] tracking-[0.005em] leading-[0.98]">
              SAAD BIN FAISAL
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-wordmark text-[11px] text-[#888888] tracking-[0.04em]">
                BYSAAD
              </span>
              <span className="w-1 h-1 bg-[#1A1A1A]"></span>
              <span className="font-microlabel text-[8px] text-[#3A3A3A]">
                V2.4 ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Switches */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 font-microlabel text-[#3A3A3A]">
            OPERATIONAL VIEWS
          </div>
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[2px] transition-colors relative text-left ${
                  isActive
                    ? "bg-[#111111] text-[#F2F2F2]"
                    : "text-[#888888] hover:text-[#F2F2F2] hover:bg-[#111111]/40"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#C8F135]" />
                )}

                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-[#C8F135]" : "text-[#888888]"}>
                    {item.icon}
                  </span>
                  <span className="font-display text-xs tracking-[0.005em] leading-tight">
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono rounded-[2px] border ${
                      isActive
                        ? "border-[#C8F135]/40 text-[#C8F135] bg-[#0C0C0C]"
                        : "border-[#1A1A1A] text-[#888888] bg-[#0C0C0C]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-[#1A1A1A] bg-[#0C0C0C]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#C8F135]"></span>
            <span className="font-microlabel text-[#888888]">DIRECTOR ENGINE</span>
          </div>
          <span className="font-microlabel text-[#C8F135]">LIVE</span>
        </div>

        <div className="p-2.5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="font-body text-[#888888]">Brand Lock</span>
            <span className="font-mono text-[#F2F2F2]">ENFORCED</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="font-body text-[#888888]">Deliverability</span>
            <span className="font-mono text-[#F2F2F2]">99.4%</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="font-body text-[#888888]">Active Brains</span>
            <span className="font-mono text-[#F2F2F2]">3 STRATEGIES</span>
          </div>
        </div>

        <div className="mt-3 text-[9px] text-[#3A3A3A] font-microlabel text-center">
          SAAD BIN FAISAL // ALL RIGHTS RESERVED
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
