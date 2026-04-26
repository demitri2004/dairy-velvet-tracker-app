## Local Secrets Setup

Tracked environment files use placeholders on purpose.

Before running the app locally, put your real values into:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Optional local-only reference files are ignored by git:

- `src/environments/environment.local.ts`
- `src/environments/environment.prod.local.ts`

This repo is wired so local builds use the ignored files:

- `ng serve` / development builds use `src/environments/environment.local.ts`
- `ng build` and `ios:sync` use `src/environments/environment.prod.local.ts`

Example shape:

```ts
export const environment = {
  production: false,
  googleSheetsWebhookUrl: 'PASTE_YOUR_WEBHOOK_URL_HERE',
  googleSheetsSharedSecret: 'PASTE_YOUR_SHARED_SECRET_HERE',
};
```
