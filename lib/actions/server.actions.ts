"use server";

export type ProcessDMPayload = {
  message: string;
  userId?: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
};

const WORKER_URL = "https://connect-me-ai.ahu-4e8.workers.dev/process-dm";


export async function processDMStream(
  payload: ProcessDMPayload,
  timeoutMs = 30_000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `processDMStream failed: ${res.status} ${res.statusText} ${text}`
      );
    }

    if (!res.body) throw new Error("No body stream available on worker response");
    return res.body;
  } finally {
    clearTimeout(id);
  }
}
