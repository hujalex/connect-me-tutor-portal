# Zoom Webhook Setup Guide

This guide will walk you through setting up Zoom webhooks to track participant join/leave events across your master account and sub-accounts.

## Overview

The system uses a single webhook endpoint (`/api/zoom/webhooks`) that handles events from all Zoom meetings. Each meeting is identified by its Zoom Meeting UUID, and webhook secrets are mapped to these UUIDs for authentication.

## Prerequisites

- Zoom account (master account with sub-accounts if applicable)
- Access to Zoom Marketplace
- Environment variables configured in your project

## Step 1: Create Zoom App

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in with your Zoom account
3. Click **"Develop"** → **"Build App"**
4. Choose **"Server-to-Server OAuth"** app type
5. Fill in app information:
   - App Name: "Connect Me Tutor Portal Webhooks" (or your preferred name)
   - Company Name: Your organization name
   - Developer Contact: Your email
6. Click **"Create"**

## Step 2: Configure App Credentials

1. In your app settings, go to **"Information"** tab
2. Note your **Client ID** and **Client Secret** (you'll need these later if implementing OAuth)
3. Go to **"Activation"** tab
4. Activate your app

## Step 3: Enable Webhooks

1. In your app dashboard, navigate to **"Features"** → **"Event Subscriptions"**
2. Click **"Add Event Subscription"**
3. Configure the subscription:
   - **Subscription Name**: "Meeting Participant Tracking"
   - **Event Notification Endpoint URL**:
     ```
     https://yourdomain.com/api/zoom/webhooks
     ```
     Replace `yourdomain.com` with your actual domain.

4. **Subscribe to the following events:**
   - `meeting.started`
   - `meeting.participant_joined`
   - `meeting.participant_left`
   - `meeting.ended` (optional, for completeness)

5. Click **"Save"**

## Step 4: Configure Webhook Secrets

For each Zoom meeting you want to track, you need to configure a webhook secret.

### Finding Your Zoom Meeting UUIDs

Each Zoom meeting has a unique UUID that looks like: `89d13433-04c3-48d6-9e94-f02103336554`

You can find this:

- In your `MEETING_ID_TO_SECRET` mapping in `app/api/zoom/webhooks/route.ts`
- Via Zoom API: Use the `GET /meetings/{meetingId}` endpoint
- In your database: Check the `Meetings` table's `meeting_id` field (this stores the Zoom UUID)

### Setting Up Environment Variables

Add webhook secrets to your environment variables (`.env.local` or your hosting platform):

```bash
ZOOM_LINK_A_WH_SECRET=your_secret_for_meeting_a
ZOOM_LINK_B_WH_SECRET=your_secret_for_meeting_b
ZOOM_LINK_C_WH_SECRET=your_secret_for_meeting_c
ZOOM_LINK_D_WH_SECRET=your_secret_for_meeting_d
ZOOM_LINK_E_WH_SECRET=your_secret_for_meeting_e
ZOOM_LINK_F_WH_SECRET=your_secret_for_meeting_f
ZOOM_LINK_G_WH_SECRET=your_secret_for_meeting_g
ZOOM_LINK_H_WH_SECRET=your_secret_for_meeting_h
ZOOM_LINK_I_WH_SECRET=your_secret_for_meeting_i
```

**Important:** The webhook secret is used in the Authorization Bearer header. Generate strong, random secrets for each meeting (e.g., using a password generator or `openssl rand -hex 32`).

### Mapping Meeting UUIDs to Secrets

The mapping is configured in `app/api/zoom/webhooks/route.ts`:

```typescript
const MEETING_ID_TO_SECRET: Record<string, string> = {
  "89d13433-04c3-48d6-9e94-f02103336554": config.zoom.ZOOM_LINK_A_WH_SECRET,
  "72a87729-ae87-468c-9444-5ff9b073f691": config.zoom.ZOOM_LINK_B_WH_SECRET,
  // ... etc
};
```

## Step 5: Assign App to Sub-Accounts (If Applicable)

If you have sub-accounts under a master account:

1. In Zoom Admin Portal, go to **"Account Management"** → **"Sub Accounts"**
2. For each sub-account that needs webhook tracking:
   - Select the sub-account
   - Go to **"Apps"** or **"Marketplace"**
   - Find your app and assign it
   - The app will use the same webhook URL

**Note:** All accounts (master and sub-accounts) will send webhooks to the same endpoint. The system identifies the source via the `payload.object.id` field (Zoom Meeting UUID) in each webhook.

## Step 6: Test Webhook Setup

### Initial URL Validation

When you save the webhook configuration, Zoom will send a validation request:

1. Check your server logs for the validation request
2. The endpoint should respond with:
   ```json
   {
     "plainToken": "token_from_zoom",
     "encryptedToken": "calculated_hash"
   }
   ```
3. If validation succeeds, your webhook URL is active

### Testing with Real Meetings

1. Start a Zoom meeting using one of your configured meeting IDs
2. Have participants join and leave the meeting
3. Check your application logs for:
   - `✅ Logged join for [name] in meeting [id]`
   - `✅ Updated leave time for [name] in meeting [id]`
4. Verify data in `zoom_participant_events` table:
   - Each join creates a record with `leave_time = null`
   - Each leave updates the corresponding record with `leave_time`

### Debugging

If webhooks aren't working:

1. **Check Authorization**: Verify the Authorization Bearer token matches your secret
2. **Check Meeting UUID**: Ensure the meeting UUID in the payload matches your `MEETING_ID_TO_SECRET` mapping
3. **Check Logs**: Look for error messages in your server logs
4. **Test Endpoint**: Manually test the endpoint with a sample payload

## Step 7: Verify Data in Application

After setting up webhooks, verify that participant data is being tracked:

1. Navigate to a session participation page: `/dashboard/session/[sessionID]/participation`
2. You should see:
   - Real-time participant join/leave events
   - Participant summaries with total duration
   - Activity timeline

## Troubleshooting

### Webhook Not Received

- Verify the webhook URL is publicly accessible (not localhost)
- Check that your server is running and accessible
- Verify Zoom app is activated and event subscriptions are enabled
- Check Zoom dashboard for webhook delivery status

### Authorization Failed

- Verify the Authorization Bearer header matches your secret
- Check that environment variables are loaded correctly
- Ensure the meeting UUID in the payload exists in `MEETING_ID_TO_SECRET`

### No Data Showing

- Check that `zoom_participant_events` records are being created
- Verify the session ID in the URL matches a session in your database
- Ensure the session has an associated meeting with a Zoom UUID
- Check database connection and permissions

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS for webhook URLs in production
2. **Strong Secrets**: Generate cryptographically strong secrets for each meeting
3. **Validate Payloads**: Always verify the Authorization header (already implemented)
4. **Rate Limiting**: Consider implementing rate limiting on the webhook endpoint
5. **Logging**: Log webhook events for audit purposes (already implemented)

## Additional Resources

- [Zoom Webhook Documentation](https://marketplace.zoom.us/docs/api-reference/webhook-reference)
- [Zoom Event Types](https://marketplace.zoom.us/docs/api-reference/webhook-reference/events)
- [Server-to-Server OAuth Apps](https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app)
