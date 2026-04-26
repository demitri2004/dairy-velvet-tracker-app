import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { TrackerSubmitService } from '../shared/tracker-submit.service';

interface SalesEntryForm {
  eventDate: string;
  eventName: string;
  eventNameOther: string;
  totalSales: number | null;
  cashSales: number | null;
  cardSales: number | null;
  note: string;
}

@Component({
  selector: 'app-sales-entry',
  templateUrl: './sales-entry.page.html',
  styleUrls: ['./sales-entry.page.scss'],
  standalone: false,
})
export class SalesEntryPage {
  readonly eventNames = [
    'Lansdale Market',
    'North Wales Market',
    'Horsham Market',
    'Demo / Pop-up',
    'Direct Order Pickup',
    'Other',
  ];

  form: SalesEntryForm = this.createDefaultForm();
  isSubmitting = false;

  constructor(
    private readonly trackerSubmitService: TrackerSubmitService,
    private readonly toastController: ToastController,
  ) {}

  get isOtherSelected(): boolean {
    return this.form.eventName === 'Other';
  }

  updateEventDate(event: Event): void {
    const nextValue = this.normalizeDateValue((event as CustomEvent).detail?.value);
    if (nextValue) {
      this.form.eventDate = nextValue;
    }
  }

  async submit(): Promise<void> {
    if (!this.form.eventDate || !this.form.eventName || this.form.totalSales === null) {
      await this.presentToast('Please fill in event date, event name, and total sales.', 'warning');
      return;
    }

    if (this.isOtherSelected && !this.form.eventNameOther.trim()) {
      await this.presentToast('Please describe the custom event name.', 'warning');
      return;
    }

    const cashSales = this.form.cashSales ?? 0;
    const cardSales = this.form.cardSales ?? 0;

    if (this.form.cashSales !== null && this.form.cardSales !== null) {
      const totalPieces = Number((cashSales + cardSales).toFixed(2));
      const enteredTotal = Number(this.form.totalSales.toFixed(2));

      if (totalPieces !== enteredTotal) {
        await this.presentToast('Cash plus card must equal total sales.', 'warning');
        return;
      }
    }

    const payload = {
      sheetName: 'Sales',
      entryType: 'sales' as const,
      data: {
        submitted_at: new Date().toISOString(),
        event_date: this.form.eventDate,
        event_name: this.form.eventName,
        event_name_other: this.isOtherSelected ? this.form.eventNameOther.trim() : '',
        total_sales: Number(this.form.totalSales.toFixed(2)),
        cash_sales: this.form.cashSales === null ? null : Number(cashSales.toFixed(2)),
        card_sales: this.form.cardSales === null ? null : Number(cardSales.toFixed(2)),
        note: this.form.note.trim(),
        source_app: 'dairy-velvet-tracking-app',
      },
    };

    this.isSubmitting = true;

    this.trackerSubmitService
      .submit(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: async () => {
          this.form = this.createDefaultForm();
          await this.presentToast('Sales entry sent to Google Sheets.', 'success');
        },
        error: async (error: Error) => {
          await this.presentToast(error.message || 'Unable to send sales entry.', 'danger');
        },
      });
  }

  private createDefaultForm(): SalesEntryForm {
    return {
      eventDate: new Date().toISOString().slice(0, 10),
      eventName: 'Lansdale Market',
      eventNameOther: '',
      totalSales: null,
      cashSales: null,
      cardSales: null,
      note: '',
    };
  }

  private normalizeDateValue(value: string | string[] | null | undefined): string {
    if (!value) {
      return '';
    }

    const raw = Array.isArray(value) ? value[0] : value;
    return raw ? raw.slice(0, 10) : '';
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2400,
      position: 'top',
    });

    await toast.present();
  }
}
