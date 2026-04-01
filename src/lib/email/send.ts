import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return { success: false, error: "No API key" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Oren Portal <notifications@oren.com>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email send failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export function approvalRequestEmail(params: {
  recipientName: string;
  approvalTitle: string;
  projectTitle: string;
  approvalType: string;
  portalUrl: string;
}) {
  return {
    subject: `Action Required: ${params.approvalTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Oren Client Portal</h2>
        <p>Hi ${params.recipientName},</p>
        <p>A new <strong>${params.approvalType}</strong> approval request needs your attention:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-weight: 600;">${params.approvalTitle}</p>
          <p style="margin: 4px 0 0; color: #666;">Project: ${params.projectTitle}</p>
        </div>
        <a href="${params.portalUrl}/approvals" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
          Review in Portal
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Sent by Oren Client Portal</p>
      </div>
    `,
  };
}

export function commentNotificationEmail(params: {
  recipientName: string;
  commenterName: string;
  targetTitle: string;
  commentBody: string;
  portalUrl: string;
  projectId: string;
}) {
  return {
    subject: `New comment on ${params.targetTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Oren Client Portal</h2>
        <p>Hi ${params.recipientName},</p>
        <p><strong>${params.commenterName}</strong> commented on <strong>${params.targetTitle}</strong>:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 3px solid #3b82f6;">
          <p style="margin: 0;">${params.commentBody}</p>
        </div>
        <a href="${params.portalUrl}/projects/${params.projectId}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
          View in Portal
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Sent by Oren Client Portal</p>
      </div>
    `,
  };
}
