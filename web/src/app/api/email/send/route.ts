import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getCRMData, updateLead, updatePlaybook } from "@/lib/dataBridge";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, format = "plain", subject, body: emailBody } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
    }

    const crmData = await getCRMData();
    const lead = crmData.leads.find((l) => l.id === leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const toEmail = lead.email || "prospect@example.com";
    const emailSubject = subject || lead.email_subject || "Teardown";
    const emailContent = emailBody || (format === "html" ? lead.email_draft_html : lead.email_draft_plain) || "";

    const resendApiKey = process.env.RESEND_API_KEY;
    const isLiveResend = resendApiKey && !resendApiKey.includes("123456789") && resendApiKey.startsWith("re_");

    let messageId = `<bysaad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@bysaad.com>`;
    let simulated = true;

    if (isLiveResend) {
      try {
        const resend = new Resend(resendApiKey);
        const fromAddress = process.env.OUTBOUND_FROM_EMAIL || "Saad Bin Faisal <onboarding@resend.dev>";

        const sendPayload: any = {
          from: fromAddress,
          to: [toEmail],
          subject: emailSubject,
          headers: {
            "X-Entity-Ref-ID": lead.id,
            "X-Audit-Slug": lead.audit_slug,
          },
        };

        if (format === "html") {
          sendPayload.html = emailContent;
        } else {
          sendPayload.text = emailContent;
        }

        const resendResponse = await resend.emails.send(sendPayload);
        if (resendResponse.data?.id) {
          messageId = resendResponse.data.id;
          simulated = false;
          console.log(`[email/send] Live email dispatched via Resend! ID: ${messageId} -> ${toEmail}`);
        } else if (resendResponse.error) {
          console.warn("[email/send] Resend API notice:", resendResponse.error.message);
          // If custom domain is not yet verified in Resend, retry via onboarding@resend.dev sandbox
          if (
            fromAddress !== "Saad Bin Faisal <onboarding@resend.dev>" &&
            (resendResponse.error.message?.toLowerCase().includes("domain") ||
              resendResponse.error.message?.toLowerCase().includes("verify"))
          ) {
            try {
              sendPayload.from = "Saad Bin Faisal <onboarding@resend.dev>";
              const retry = await resend.emails.send(sendPayload);
              if (retry.data?.id) {
                messageId = retry.data.id;
                simulated = false;
                console.log(`[email/send] Live email dispatched via Resend sandbox! ID: ${messageId} -> ${toEmail}`);
              }
            } catch (retryErr: any) {
              console.warn("[email/send] Sandbox retry notice:", retryErr.message);
            }
          }
        }
      } catch (sendErr: any) {
        console.warn("[email/send] Resend error, falling back to simulated dispatch:", sendErr.message);
      }
    }

    const now = new Date().toISOString();
    const isFollowUp = lead.status === "follow_up_due";

    const updates: any = {
      outbound_message_id: messageId,
      status: isFollowUp ? "follow_up_due" : "emailed_step_1",
    };

    if (isFollowUp) {
      updates.follow_up_sent_at = now;
    } else {
      updates.sent_at = now;
    }

    if (subject) updates.email_subject = subject;
    if (format === "plain" && emailBody) updates.email_draft_plain = emailBody;

    const updatedLead = await updateLead(leadId, updates);

    // Increment emails_sent on director playbook strategy
    if (lead.director_angle_id) {
      const strat = crmData.playbooks.find((p) => p.id === lead.director_angle_id);
      if (strat) {
        const newSent = (strat.emails_sent || 0) + 1;
        const newReplies = strat.replies_received || 0;
        const newScore = newSent > 0 ? Number(((newReplies / newSent) * 100).toFixed(1)) : 0;
        await updatePlaybook(strat.id, {
          emails_sent: newSent,
          conversion_score: newScore,
        });
      }
    }

    return NextResponse.json({
      success: true,
      messageId,
      simulated,
      lead: updatedLead,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
