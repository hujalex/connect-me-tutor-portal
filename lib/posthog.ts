import { PostHog } from "posthog-node";

// Singleton pattern to reuse PostHog client instance
let posthogClient: PostHog | null = null;

/**
 * PostHog properties are flat; nested objects are often truncated or dropped.
 * Stringify objects/arrays/errors so full messages appear in the UI.
 */
function serializeForPostHog(value: unknown): string | number | boolean | null {
  if (value === null) return null;
  if (value === undefined) return null;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") {
    return value as string | number | boolean;
  }
  if (value instanceof Error) {
    return JSON.stringify({
      name: value.name,
      message: value.message,
      stack: value.stack,
    });
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function normalizePropertiesForPostHog(
  properties?: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  if (!properties) return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    out[key] = serializeForPostHog(value);
  }
  return out;
}

/**
 * Get or create PostHog client instance
 * Uses singleton pattern to reuse connection
 */
function getPostHogClient(): PostHog | null {
  // Return null if PostHog is not configured (graceful degradation)
  if (
    !process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    !process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1, // Flush immediately for real-time debugging
      flushInterval: 0, // Disable interval flushing, use immediate
    });
  }

  return posthogClient;
}

/**
 * Log an event to PostHog with properties
 * Gracefully handles cases where PostHog is not configured
 */
export async function logEvent(
  eventName: string,
  properties?: Record<string, any>,
  distinctId?: string
) {
  const client = getPostHogClient();
  if (!client) {
    // Silently fail if PostHog is not configured
    return;
  }

  try {
    const normalized = normalizePropertiesForPostHog({
      ...properties,
      timestamp: new Date().toISOString(),
    });
    client.capture({
      distinctId: distinctId || "zoom-webhook",
      event: eventName,
      properties: normalized,
    });

    // Flush immediately for real-time debugging
    await client.flush();
  } catch (error) {
    // Log error but don't throw - we don't want PostHog failures to break webhooks
    console.error("PostHog logging error:", error);
  }
}

/**
 * Log an error event to PostHog
 */
export async function logError(
  error: Error | unknown,
  context?: Record<string, any>,
  distinctId?: string
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorFullJson =
    error instanceof Error
      ? JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      : typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : JSON.stringify({ value: String(error) });

  await logEvent(
    "zoom_webhook_error",
    {
      error_message: errorMessage,
      error_stack: errorStack,
      error_full_json: errorFullJson,
      ...context,
    },
    distinctId
  );
}

// Export the client function for direct use if needed
export default function PostHogClient() {
  return getPostHogClient();
}
