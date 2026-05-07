import { createAdminClient } from "@/lib/supabase/server";
import { sendChatMessageNotificationEmail } from "@/lib/actions/email.server.actions";
import {
  buildChatRoomUrl,
  isChatRoomEmailMuted,
  resolveChatRecipientProfiles,
  type ChatRoomType,
} from "@/lib/chat/resolve-chat-recipients";

type DispatchArgs = {
  roomId: string;
  roomType: ChatRoomType;
  senderProfileId: string;
  senderFirstName: string;
  senderLastName: string;
  messagePreview: string;
};

export async function dispatchChatMessageEmails({
  roomId,
  roomType,
  senderProfileId,
  senderFirstName,
  senderLastName,
  messagePreview,
}: DispatchArgs): Promise<void> {
  const runId = `chat-notification-audit-${Date.now()}`;
  try {
    // #region agent log
    fetch("http://127.0.0.1:7374/ingest/94440f61-3c1c-4498-ac42-e63919337829", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "40e4d5",
      },
      body: JSON.stringify({
        sessionId: "40e4d5",
        runId,
        hypothesisId: "H1",
        location: "lib/chat/dispatch-chat-message-emails.ts:29",
        message: "dispatch entry",
        data: { roomId, roomType, senderProfileId },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const admin = await createAdminClient();
    const recipients = await resolveChatRecipientProfiles(
      admin,
      roomId,
      roomType,
    );

    // #region agent log
    fetch("http://127.0.0.1:7374/ingest/94440f61-3c1c-4498-ac42-e63919337829", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "40e4d5",
      },
      body: JSON.stringify({
        sessionId: "40e4d5",
        runId,
        hypothesisId: "H1",
        location: "lib/chat/dispatch-chat-message-emails.ts:53",
        message: "resolved recipients",
        data: {
          recipientCount: recipients.length,
          recipientIds: recipients.map((r) => r.id),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const senderName =
      `${senderFirstName} ${senderLastName}`.trim() || "Someone";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.connectmego.app";
    const chatRoomUrl = buildChatRoomUrl(siteUrl, roomType, roomId);
    const preview =
      messagePreview.length > 500
        ? `${messagePreview.slice(0, 497)}...`
        : messagePreview;

    for (const r of recipients) {
      let skipReason: string | null = null;
      if (r.id === senderProfileId) skipReason = "sender";
      else if (!r.email) skipReason = "missing_email";

      const muted = await isChatRoomEmailMuted(admin, r.id, roomId);
      if (!skipReason && muted) skipReason = "room_muted";

      // #region agent log
      fetch("http://127.0.0.1:7374/ingest/94440f61-3c1c-4498-ac42-e63919337829", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "40e4d5",
        },
        body: JSON.stringify({
          sessionId: "40e4d5",
          runId,
          hypothesisId: "H2",
          location: "lib/chat/dispatch-chat-message-emails.ts:82",
          message: "recipient delivery decision",
          data: {
            recipientProfileId: r.id,
            hasEmail: Boolean(r.email),
            muted,
            skipReason,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      if (skipReason) continue;

      try {
        await sendChatMessageNotificationEmail({
          to: r.email as string,
          recipientName: `${r.first_name} ${r.last_name}`.trim(),
          senderName,
          messagePreview: preview,
          chatRoomUrl,
        });
        // #region agent log
        fetch("http://127.0.0.1:7374/ingest/94440f61-3c1c-4498-ac42-e63919337829", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "40e4d5",
          },
          body: JSON.stringify({
            sessionId: "40e4d5",
            runId,
            hypothesisId: "H4",
            location: "lib/chat/dispatch-chat-message-emails.ts:113",
            message: "chat notification email sent",
            data: { recipientProfileId: r.id },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch("http://127.0.0.1:7374/ingest/94440f61-3c1c-4498-ac42-e63919337829", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "40e4d5",
          },
          body: JSON.stringify({
            sessionId: "40e4d5",
            runId,
            hypothesisId: "H4",
            location: "lib/chat/dispatch-chat-message-emails.ts:132",
            message: "chat notification email send failed",
            data: {
              recipientProfileId: r.id,
              error:
                error instanceof Error ? error.message : "unknown_send_error",
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      }
    }
  } catch (e) {
    // #region agent log
    fetch("http://127.0.0.1:7374/ingest/94440f61-3c1c-4498-ac42-e63919337829", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "40e4d5",
      },
      body: JSON.stringify({
        sessionId: "40e4d5",
        runId,
        hypothesisId: "H1",
        location: "lib/chat/dispatch-chat-message-emails.ts:151",
        message: "dispatch failed",
        data: { error: e instanceof Error ? e.message : "unknown_dispatch_error" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.error("dispatchChatMessageEmails", e);
  }
}
