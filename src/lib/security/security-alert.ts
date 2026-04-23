type SecurityAlertLevel = "info" | "warn" | "error";

type SecurityAlertPayload = {
  event: string;
  level?: SecurityAlertLevel;
  detail?: Record<string, unknown>;
};

export async function sendSecurityAlert(payload: SecurityAlertPayload) {
  const level = payload.level ?? "warn";
  const body = {
    event: payload.event,
    level,
    detail: payload.detail ?? {},
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error("[security]", body);
  } else if (level === "info") {
    console.info("[security]", body);
  } else {
    console.warn("[security]", body);
  }

  const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("[security] webhook delivery failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

