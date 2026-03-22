# Middleware Notifications

When tasks change state or users are assigned, trigger notifications.

Possible channels:
- In-app (push/real-time websocket)
- Email (via SendGrid/Mailgun)
- Slack/Teams webhooks

Keep notifications decoupled via a service layer to allow swapping providers.
