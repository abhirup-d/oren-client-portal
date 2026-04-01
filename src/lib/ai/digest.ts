import Anthropic from "@anthropic-ai/sdk";

export async function generateDigest(
  activities: Array<{
    action: string;
    details: Record<string, unknown> | null;
    created_at: string;
  }>,
  projectNames: Map<string, string>
): Promise<string> {
  if (activities.length === 0) {
    return "No new activity since your last visit.";
  }

  const activityText = activities
    .map((a) => {
      const project = a.details?.project_id
        ? projectNames.get(a.details.project_id as string) || "a project"
        : "";
      return `- ${a.action}: ${JSON.stringify(a.details || {})}${project ? ` (${project})` : ""} at ${a.created_at}`;
    })
    .join("\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Summarize these recent project activities into 2-3 concise bullet points for a client dashboard. Use natural language, be specific about what changed. Activities:\n${activityText}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock?.text || "Recent updates are available.";
}
