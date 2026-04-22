# Business Rules

- Routines must declare a concurrency policy and a catch-up policy.
- Triggered runs must preserve queue and workflow state for operator follow-up.
- Webhook and reminder routines should route into human inboxes instead of silently completing.
