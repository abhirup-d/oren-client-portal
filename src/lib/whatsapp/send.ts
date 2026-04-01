const WHATSAPP_API_BASE = "https://graph.facebook.com/v18.0";

interface SendWhatsAppParams {
  to: string;
  message: string;
}

interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsApp({ to, message }: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp] WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set — skipping send");
    return { success: false, error: "WhatsApp not configured" };
  }

  // Normalise phone number — strip spaces, ensure it starts without +
  const normalised = to.replace(/\s+/g, "").replace(/^\+/, "");

  try {
    const res = await fetch(`${WHATSAPP_API_BASE}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalised,
        type: "text",
        text: { body: message },
      }),
    });

    const data = (await res.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };

    if (!res.ok) {
      const errMsg = data.error?.message ?? `HTTP ${res.status}`;
      console.error("[WhatsApp] API error:", errMsg);
      return { success: false, error: errMsg };
    }

    const messageId = data.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[WhatsApp] Fetch error:", errMsg);
    return { success: false, error: errMsg };
  }
}

// --- Template message helpers ---

export function approvalWhatsAppMessage({
  clientName,
  projectTitle,
  approvalTitle,
  portalUrl,
}: {
  clientName: string;
  projectTitle: string;
  approvalTitle: string;
  portalUrl: string;
}): string {
  return (
    `Hi ${clientName},\n\n` +
    `An approval requires your attention on the *${projectTitle}* project.\n\n` +
    `*${approvalTitle}*\n\n` +
    `Please review and respond at: ${portalUrl}/approvals\n\n` +
    `— Oren (Maroon Oak Technologies)`
  );
}

export function overdueInvoiceWhatsAppMessage({
  clientName,
  invoiceNumber,
  amount,
  currency,
  paymentUrl,
}: {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
}): string {
  const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  let msg =
    `Hi ${clientName},\n\n` +
    `This is a reminder that invoice *${invoiceNumber}* for *${formatted}* is overdue.\n\n`;

  if (paymentUrl) {
    msg += `Pay now: ${paymentUrl}\n\n`;
  }

  msg += `— Oren (Maroon Oak Technologies)`;
  return msg;
}
