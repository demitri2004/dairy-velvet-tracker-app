import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TrackerPayload {
  sheetName: string;
  entryType: 'time' | 'sales' | 'batch';
  data: Record<string, string | number | null>;
}

@Injectable({
  providedIn: 'root',
})
export class TrackerSubmitService {
  submit(payload: TrackerPayload): Observable<unknown> {
    if (!environment.googleSheetsWebhookUrl) {
      return throwError(() => new Error('Google Sheets webhook URL is not configured.'));
    }

    return from(this.submitViaFetch(payload));
  }

  private async submitViaFetch(payload: TrackerPayload): Promise<void> {
    const requestPayload = {
      ...payload,
      sharedSecret: environment.googleSheetsSharedSecret || '',
    };

    await fetch(environment.googleSheetsWebhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(requestPayload),
    });
  }
}
