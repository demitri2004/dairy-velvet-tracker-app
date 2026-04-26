## Tracking Backlog

### Next Up

- Add `submitted_by_device` to every `Time`, `Sales`, and `Batch` submission.
- Add `submitted_by_user` once we have a lightweight user label per device.

### Recommended Approach

- Use the device as the first source of identity.
- Give each phone a stable local label, for example:
  - `Nadia iPhone`
  - `Wife iPhone`
- Include that label in every payload sent to Google Sheets.

### Why This Approach

- No login flow needed for v1.
- Works well for a shared household/business app.
- Keeps entries attributable without adding friction at submit time.

### Follow-On Implementation

1. Add a small device identity service in the app.
2. Store a per-device label locally on first setup.
3. Send `submitted_by_device` with every webhook payload.
4. Add matching columns to the Apps Script `TRACKER_HEADERS`.
5. Later, optionally add a visible "user" or "device" setting screen.

### Notes

- Device-based tracking is the right first version.
- If we later want more precision, we can keep `submitted_by_device` and add `submitted_by_user` alongside it rather than replacing it.
