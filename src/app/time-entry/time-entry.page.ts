import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { TrackerSubmitService } from '../shared/tracker-submit.service';

interface TimeEntryForm {
  entryDate: string;
  timeType: string;
  timeTypeOther: string;
  durationMinutes: number | null;
  note: string;
}

@Component({
  selector: 'app-time-entry',
  templateUrl: './time-entry.page.html',
  styleUrls: ['./time-entry.page.scss'],
  standalone: false,
})
export class TimeEntryPage {
  readonly timeTypes = [
    'Production',
    'Packing / Labeling',
    'Market Prep',
    'Market Selling',
    'Admin',
    'Marketing / Content',
    'Delivery / Pickup',
    'Cleanup',
    'Other',
  ];

  form: TimeEntryForm = this.createDefaultForm();
  isSubmitting = false;

  constructor(
    private readonly trackerSubmitService: TrackerSubmitService,
    private readonly toastController: ToastController,
  ) {}

  get isOtherSelected(): boolean {
    return this.form.timeType === 'Other';
  }

  updateEntryDate(event: Event): void {
    const nextValue = this.normalizeDateValue((event as CustomEvent).detail?.value);
    if (nextValue) {
      this.form.entryDate = nextValue;
    }
  }

  async submit(): Promise<void> {
    if (!this.form.entryDate || !this.form.timeType || !this.form.durationMinutes) {
      await this.presentToast('Please fill in date, time type, and duration.', 'warning');
      return;
    }

    if (this.isOtherSelected && !this.form.timeTypeOther.trim()) {
      await this.presentToast('Please describe the custom time type.', 'warning');
      return;
    }

    const payload = {
      sheetName: 'Time',
      entryType: 'time' as const,
      data: {
        submitted_at: new Date().toISOString(),
        entry_date: this.form.entryDate,
        time_type: this.form.timeType,
        time_type_other: this.isOtherSelected ? this.form.timeTypeOther.trim() : '',
        duration_minutes: this.form.durationMinutes,
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
          await this.presentToast('Time entry sent to Google Sheets.', 'success');
        },
        error: async (error: Error) => {
          await this.presentToast(error.message || 'Unable to send time entry.', 'danger');
        },
      });
  }

  private createDefaultForm(): TimeEntryForm {
    return {
      entryDate: new Date().toISOString().slice(0, 10),
      timeType: 'Production',
      timeTypeOther: '',
      durationMinutes: null,
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
