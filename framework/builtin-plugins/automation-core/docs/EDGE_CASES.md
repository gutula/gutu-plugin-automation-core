# Edge Cases

- Drop or replace duplicate triggers according to routine concurrency policy.
- Keep paused routines from triggering.
- Collapse missed schedule windows when catch-up policy says not to replay every missed event.
