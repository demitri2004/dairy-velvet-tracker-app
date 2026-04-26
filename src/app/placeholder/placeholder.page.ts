import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { TrackerSubmitService } from '../shared/tracker-submit.service';

interface BatchForm {
  dvBatchNumber: string;
  cheese: number | null;
  butter: number | null;
  sugar: number | null;
  vanilla: number | null;
  cocoaPowder: number | null;
  coatingCompoundChocolate: number | null;
  coconutOil: number | null;
  milk: number | null;
  lecithin: number | null;
  salt: number | null;
  other: number | null;
  note: string;
}

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.page.html',
  styleUrls: ['./placeholder.page.scss'],
  standalone: false,
})
export class PlaceholderPage {
  private readonly batchCacheKey = 'dv-last-batch-form';

  form: BatchForm = this.createDefaultForm();
  isSubmitting = false;
  latestSavedBatchNumber: string | null = null;

  constructor(
    private readonly trackerSubmitService: TrackerSubmitService,
    private readonly toastController: ToastController,
  ) {}

  ngOnInit(): void {
    this.prefillFromLastSavedBatch();
  }

  async submit(): Promise<void> {
    const payload = {
      sheetName: 'Batch',
      entryType: 'batch' as const,
      data: {
        submitted_at: new Date().toISOString(),
        dv_batch_number: this.form.dvBatchNumber.trim(),
        cheese: this.form.cheese,
        butter: this.form.butter,
        sugar: this.form.sugar,
        vanilla: this.form.vanilla,
        cocoa_powder: this.form.cocoaPowder,
        coating_compound_chocolate: this.form.coatingCompoundChocolate,
        coconut_oil: this.form.coconutOil,
        milk: this.form.milk,
        lecithin: this.form.lecithin,
        salt: this.form.salt,
        other: this.form.other,
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
          this.saveLastBatchLocally();
          await this.presentToast('Batch entry sent to Google Sheets.', 'success');
        },
        error: async (error: Error) => {
          await this.presentToast(error.message || 'Unable to send batch entry.', 'danger');
        },
      });
  }

  private createDefaultForm(): BatchForm {
    return {
      dvBatchNumber: '',
      cheese: null,
      butter: null,
      sugar: null,
      vanilla: null,
      cocoaPowder: null,
      coatingCompoundChocolate: null,
      coconutOil: null,
      milk: null,
      lecithin: null,
      salt: null,
      other: null,
      note: '',
    };
  }

  private prefillFromLastSavedBatch(): void {
    try {
      const savedValue = window.localStorage.getItem(this.batchCacheKey);

      if (!savedValue) {
        return;
      }

      const parsed = JSON.parse(savedValue) as BatchForm;
      this.form = {
        ...this.createDefaultForm(),
        ...parsed,
      };
      this.latestSavedBatchNumber =
        parsed.dvBatchNumber && parsed.dvBatchNumber.trim() ? parsed.dvBatchNumber.trim() : null;
    } catch {
      this.form = this.createDefaultForm();
      this.latestSavedBatchNumber = null;
    }
  }

  private saveLastBatchLocally(): void {
    window.localStorage.setItem(this.batchCacheKey, JSON.stringify(this.form));
    this.latestSavedBatchNumber =
      this.form.dvBatchNumber && this.form.dvBatchNumber.trim() ? this.form.dvBatchNumber.trim() : null;
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2400,
      position: 'top',
    });

    await toast.present();
  }
}
