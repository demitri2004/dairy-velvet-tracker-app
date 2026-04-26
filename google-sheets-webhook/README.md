# Google Sheets Webhook Setup

This app sends tracker entries to Google Sheets through a Google Apps Script web app.

## 1. Create the spreadsheet

Create one Google Sheet for the tracker, for example:

- `Dairy Velvet Tracker`

You do not need to create the `Time` and `Sales` tabs manually. The script will create them if they do not exist.
You also do not need to create the `Batch` tab manually. The script will create it if it does not exist.

## 2. Add the Apps Script code

In the target spreadsheet:

1. Open `Extensions -> Apps Script`
2. Replace the default code with the contents of [Code.gs](./Code.gs)
3. Save the project

## 3. Add an optional shared secret

In Apps Script:

1. Open `Project Settings`
2. Under `Script Properties`, add:
   - Key: `TRACKER_SHARED_SECRET`
   - Value: any long random string you want

If you set a secret there, put the same value into the app environment files:

- [src/environments/environment.ts](/Users/nadiakarpov/development/dairy-velvet-tracking-app/src/environments/environment.ts)
- [src/environments/environment.prod.ts](/Users/nadiakarpov/development/dairy-velvet-tracking-app/src/environments/environment.prod.ts)

## 4. Deploy the web app

In Apps Script:

1. Click `Deploy -> New deployment`
2. Choose `Web app`
3. Execute as: `Me`
4. Who has access: `Anyone`
5. Deploy
6. Copy the web app URL

## 5. Add the webhook URL to the app

Paste the deployed URL into:

- [src/environments/environment.ts](/Users/nadiakarpov/development/dairy-velvet-tracking-app/src/environments/environment.ts)
- [src/environments/environment.prod.ts](/Users/nadiakarpov/development/dairy-velvet-tracking-app/src/environments/environment.prod.ts)

Example:

```ts
export const environment = {
  production: false,
  googleSheetsWebhookUrl: 'https://script.google.com/macros/s/REPLACE_ME/exec',
  googleSheetsSharedSecret: 'REPLACE_ME',
};
```

## 6. Restart the dev server

```bash
cd /Users/nadiakarpov/development/dairy-velvet-tracking-app
source ~/.nvm/nvm.sh
nvm use 22
npm start
```

## Notes

- The app uses a `fetch` request in `no-cors` mode so local browser testing can post to the Apps Script webhook without getting blocked by cross-origin response handling.
- The script appends rows only to `Time`, `Sales`, and `Batch`.
- Empty values are written as blank cells.
