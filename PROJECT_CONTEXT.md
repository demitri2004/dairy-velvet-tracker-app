## Dairy Velvet Tracker App Context

### What This App Does

- `Time` tab logs business time to the `Time` sheet tab.
- `Sales` tab logs market and sales entries to the `Sales` sheet tab.
- `Batch` tab logs production ingredient entries to the `Batch` sheet tab.

### Current Stack

- Angular + Ionic + Capacitor
- iOS app is already set up in `ios/`
- Google Sheets webhook is implemented through Apps Script in `google-sheets-webhook/Code.gs`

### Important Working Behavior

- Local development uses ignored secrets from `src/environments/environment.local.ts`
- Local production builds and `ios:sync` use ignored secrets from `src/environments/environment.prod.local.ts`
- Tracked env files contain placeholders only
- Batch entries save `DV Batch #` as text so leading zeroes like `003` are preserved
- Batch tab prefills from the most recent batch saved on the device, not by reading the latest row from Google Sheets
- Batch tab also shows the last saved batch number from the device-local cached batch

### Important Constraints

- Google Apps Script webhook writes are reliable enough for v1
- Google Apps Script reads from the app were flaky (`404`/account-scoped redirect issues), so cross-device readbacks were intentionally avoided
- For now, any "last batch" helper text is device-local, not globally synced from Drive

### Useful Repo Notes

- `TRACKING_BACKLOG.md` contains the next product ideas, especially device/user attribution
- `LOCAL_SECRETS_SETUP.md` explains the local secret file setup

### Good Next Steps

1. Add `submitted_by_device` to all payloads
2. Add a lightweight device label setup flow
3. Add camera/OCR assistance for Batch entry
4. Optionally add a settings screen
