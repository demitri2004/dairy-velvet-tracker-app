import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { TrackerSubmitService } from '../shared/tracker-submit.service';

const ADD_NEW_SENTINEL = '__add_new__';

interface MilesEntryForm {
  tripDate: string;
  tripType: string;
  purposeNotes: string;
  fromLocation: string;
  toLocation: string;
  odometerStart: number | null;
  odometerEnd: number | null;
  milesDriven: number | null;
  reimbursable: 'Yes' | 'No';
}

@Component({
  selector: 'app-miles-entry',
  templateUrl: './miles-entry.page.html',
  styleUrls: ['./miles-entry.page.scss'],
  standalone: false,
})
export class MilesEntryPage {
  tripTypes = ['Kitchen', 'Ingredient Pickup', 'Market'];

  form: MilesEntryForm = this.createDefaultForm();
  isSubmitting = false;

  addingNewTripType = false;
  newTripTypeName = '';

  constructor(
    private readonly trackerSubmitService: TrackerSubmitService,
    private readonly toastController: ToastController,
  ) {}

  readonly marketPurposeOptions = ['LFM', 'NWFM', 'HFM'];

  get isMarketSelected(): boolean {
    return this.form.tripType === 'Market';
  }

  onTripTypeChange(value: string): void {
    if (value === ADD_NEW_SENTINEL) {
      this.addingNewTripType = true;
      this.newTripTypeName = '';
    } else {
      this.form.purposeNotes = '';
    }
  }

  confirmNewTripType(): void {
    const name = this.newTripTypeName.trim();
    if (!name) {
      return;
    }
    if (!this.tripTypes.includes(name)) {
      this.tripTypes = [...this.tripTypes, name];
    }
    this.form.tripType = name;
    this.addingNewTripType = false;
    this.newTripTypeName = '';
  }

  cancelNewTripType(): void {
    this.form.tripType = this.tripTypes[0];
    this.addingNewTripType = false;
    this.newTripTypeName = '';
  }

  onOdometerChange(): void {
    if (this.form.odometerStart !== null && this.form.odometerEnd !== null) {
      const miles = this.form.odometerEnd - this.form.odometerStart;
      this.form.milesDriven = miles >= 0 ? Number(miles.toFixed(1)) : null;
    }
  }

  updateTripDate(event: Event): void {
    const nextValue = this.normalizeDateValue((event as CustomEvent).detail?.value);
    if (nextValue) {
      this.form.tripDate = nextValue;
    }
  }

  async submit(): Promise<void> {
    if (!this.form.tripDate || !this.form.tripType || this.form.tripType === ADD_NEW_SENTINEL) {
      await this.presentToast('Please fill in trip date and trip type.', 'warning');
      return;
    }

    const payload = {
      sheetName: 'Miles',
      entryType: 'miles' as const,
      data: {
        submitted_at: new Date().toISOString(),
        trip_date: this.form.tripDate,
        trip_type: this.form.tripType,
        purpose_notes: this.form.purposeNotes.trim(),
        from_location: this.form.fromLocation.trim(),
        to_location: this.form.toLocation.trim(),
        odometer_start: this.form.odometerStart,
        odometer_end: this.form.odometerEnd,
        miles_driven: this.form.milesDriven,
        reimbursable: this.form.reimbursable,
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
          await this.presentToast('Miles entry sent to Google Sheets.', 'success');
        },
        error: async (error: Error) => {
          await this.presentToast(error.message || 'Unable to send miles entry.', 'danger');
        },
      });
  }

  private createDefaultForm(): MilesEntryForm {
    return {
      tripDate: new Date().toISOString().slice(0, 10),
      tripType: this.tripTypes[0],
      purposeNotes: '',
      fromLocation: '',
      toLocation: '',
      odometerStart: null,
      odometerEnd: null,
      milesDriven: null,
      reimbursable: 'No',
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
