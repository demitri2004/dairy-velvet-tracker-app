import { Component } from '@angular/core';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import {
  Camera,
  CameraDirection,
  MediaResult,
  MediaTypeSelection,
} from '@capacitor/camera';
import { Ocr, TextDetection } from '@capacitor-community/image-to-text';
import { TrackerSubmitService } from '../shared/tracker-submit.service';

interface BatchForm {
  dvBatchNumber: string;
  manufacturedDate: string;
  cheese: string;
  butter: string;
  sugar: string;
  vanilla: string;
  cocoaPowder: string;
  coatingCompoundChocolate: string;
  coconutOil: string;
  milk: string;
  lecithin: string;
  salt: string;
  other: string;
  note: string;
}

type FormFieldKey = keyof BatchForm;

type BatchFieldKey =
  | 'cheese'
  | 'butter'
  | 'sugar'
  | 'vanilla'
  | 'cocoaPowder'
  | 'coatingCompoundChocolate'
  | 'coconutOil'
  | 'milk'
  | 'lecithin'
  | 'salt'
  | 'other';

interface ScanReviewState {
  imageUri: string;
  barcodeValues: string[];
  ocrLines: string[];
  extractedBatchNumber: string | null;
  extractedValues: Partial<Record<BatchFieldKey, string>>;
}

interface IngredientMatcher {
  key: BatchFieldKey;
  label: string;
  patterns: string[];
}

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.page.html',
  styleUrls: ['./placeholder.page.scss'],
  standalone: false,
})
export class PlaceholderPage {
  private readonly batchCacheKey = 'dv-last-batch-form';
  private readonly ingredientMatchers: IngredientMatcher[] = [
    { key: 'cheese', label: 'Cheese', patterns: ['cheese'] },
    { key: 'butter', label: 'Butter', patterns: ['butter'] },
    { key: 'sugar', label: 'Sugar', patterns: ['sugar'] },
    { key: 'vanilla', label: 'Vanilla', patterns: ['vanilla'] },
    { key: 'cocoaPowder', label: 'Cocoa Powder', patterns: ['cocoa powder', 'cocoa'] },
    {
      key: 'coatingCompoundChocolate',
      label: 'Coating Compound Chocolate',
      patterns: ['coating compound chocolate', 'coating chocolate', 'compound chocolate'],
    },
    { key: 'coconutOil', label: 'Coconut Oil', patterns: ['coconut oil'] },
    { key: 'milk', label: 'Milk', patterns: ['milk'] },
    { key: 'lecithin', label: 'Lecithin', patterns: ['lecithin'] },
    { key: 'salt', label: 'Salt', patterns: ['salt'] },
    { key: 'other', label: 'Other', patterns: ['other'] },
  ];

  form: BatchForm = this.createDefaultForm();
  isSubmitting = false;
  isScanning = false;
  latestSavedBatchNumber: string | null = null;
  scanReview: ScanReviewState | null = null;
  focusedField: FormFieldKey | null = null;

  constructor(
    private readonly trackerSubmitService: TrackerSubmitService,
    private readonly toastController: ToastController,
    private readonly actionSheetController: ActionSheetController,
  ) {}

  ngOnInit(): void {
    this.prefillFromLastSavedBatch();
  }

  async openScanOptions(field: FormFieldKey): Promise<void> {
    if (this.isSubmitting || this.isScanning) {
      return;
    }

    this.setFocusedField(field);

    if (Capacitor.getPlatform() === 'web') {
      await this.presentToast('Scanning is available on the installed mobile app.', 'danger');
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Batch Scan',
      buttons: [
        {
          text: 'Take Photo',
          handler: () => {
            void this.scanFromCamera();
          },
        },
        {
          text: 'Choose From Photos',
          handler: () => {
            void this.scanFromGallery();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  dismissScanReview(): void {
    this.scanReview = null;
  }

  formatBatchFieldLabel(key: string): string {
    const matcher = this.ingredientMatchers.find((item) => item.key === key);
    return matcher ? matcher.label : key;
  }

  setFocusedField(field: FormFieldKey): void {
    this.focusedField = field;
  }

  getFocusedFieldLabel(): string | null {
    if (!this.focusedField) {
      return null;
    }

    if (this.focusedField === 'dvBatchNumber') {
      return 'DV Batch #';
    }

    if (this.focusedField === 'manufacturedDate') {
      return 'Date';
    }

    if (this.focusedField === 'cocoaPowder') {
      return 'Cocoa Powder';
    }

    if (this.focusedField === 'coatingCompoundChocolate') {
      return 'Coating Compound Chocolate';
    }

    if (this.focusedField === 'coconutOil') {
      return 'Coconut Oil';
    }

    return this.focusedField
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (value) => value.toUpperCase());
  }

  async copyScanLine(line: string): Promise<void> {
    const copied = await this.copyText(line);

    if (!copied) {
      await this.presentToast('Unable to copy this line on the current device.', 'danger');
      return;
    }

    await this.presentToast('OCR line copied.', 'success');
  }

  async useScanLineInFocusedField(line: string): Promise<void> {
    if (!this.focusedField) {
      await this.presentToast('Tap an input first so I know where to place the scanned line.', 'danger');
      return;
    }

    if (this.focusedField === 'dvBatchNumber') {
      this.form.dvBatchNumber = line.trim();
      this.scanReview = null;
      await this.presentToast('Inserted into DV Batch #.', 'success');
      return;
    }

    if (this.focusedField === 'manufacturedDate') {
      this.form.manufacturedDate = line.trim();
      this.scanReview = null;
      await this.presentToast('Inserted into Date.', 'success');
      return;
    }

    if (this.focusedField === 'note') {
      this.form.note = line.trim();
      this.scanReview = null;
      await this.presentToast('Inserted into Note.', 'success');
      return;
    }

    this.form[this.focusedField] = line.trim() as never;
    this.scanReview = null;
    await this.presentToast(`Inserted into ${this.getFocusedFieldLabel()}.`, 'success');
  }

  async submit(): Promise<void> {
    const payload = {
      sheetName: 'Batch',
      entryType: 'batch' as const,
      data: {
        submitted_at: new Date().toISOString(),
        dv_batch_number: this.form.dvBatchNumber.trim(),
        manufactured_date: this.form.manufacturedDate.trim(),
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

  private async scanFromCamera(): Promise<void> {
    try {
      const permissionStatus = await Camera.requestPermissions({ permissions: ['camera'] });
      if (permissionStatus.camera !== 'granted') {
        await this.presentToast('Camera permission is needed to scan a batch.', 'danger');
        return;
      }

      const media = await Camera.takePhoto({
        quality: 90,
        targetWidth: 1600,
        targetHeight: 1600,
        correctOrientation: true,
        saveToGallery: false,
        cameraDirection: CameraDirection.Rear,
        editable: 'no',
      });

      await this.processScannedMedia(media);
    } catch (error) {
      await this.handleScanError(error, 'Unable to scan from the camera.');
    }
  }

  private async scanFromGallery(): Promise<void> {
    try {
      const permissionStatus = await Camera.requestPermissions({ permissions: ['photos'] });
      if (permissionStatus.photos !== 'granted' && permissionStatus.photos !== 'limited') {
        await this.presentToast('Photo library permission is needed to import a batch image.', 'danger');
        return;
      }

      const result = await Camera.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
        allowMultipleSelection: false,
        quality: 90,
        correctOrientation: true,
      });

      const media = result.results[0];
      if (!media) {
        return;
      }

      await this.processScannedMedia(media);
    } catch (error) {
      await this.handleScanError(error, 'Unable to import a batch image.');
    }
  }

  private async processScannedMedia(media: MediaResult): Promise<void> {
    if (!media.uri) {
      await this.presentToast('The selected image does not have a readable local file path.', 'danger');
      return;
    }

    this.isScanning = true;

    try {
      const ocrResult = await Ocr.detectText({ filename: media.uri });

      const barcodeValues: string[] = [];
      const ocrLines = ocrResult.textDetections
        .map((item) => item.text.trim())
        .filter((item) => item.length > 0);

      const extractedBatchNumber = this.extractBatchNumber(barcodeValues, ocrLines);
      const extractedValues = this.extractIngredientValues(ocrLines, ocrResult.textDetections);

      this.scanReview = {
        imageUri: media.webPath || media.uri,
        barcodeValues,
        ocrLines,
        extractedBatchNumber,
        extractedValues,
      };

      if (!extractedBatchNumber && Object.keys(extractedValues).length === 0) {
        await this.presentToast('No batch values were confidently detected. Review the raw scan text below.', 'danger');
      } else {
        await this.presentToast('Scan complete. Review the detected values before applying.', 'success');
      }
    } finally {
      this.isScanning = false;
    }
  }

  private extractBatchNumber(barcodeValues: string[], ocrLines: string[]): string | null {
    const candidates = [...barcodeValues, ...ocrLines];
    const explicitPattern = /(?:dv\s*)?batch\s*#?\s*([a-z0-9-]+)/i;
    const shortCodePattern = /^(?:dv[-\s]*)?([0-9]{3,}|[a-z0-9]{3,})$/i;

    for (const candidate of candidates) {
      const explicitMatch = candidate.match(explicitPattern);
      if (explicitMatch && explicitMatch[1]) {
        return explicitMatch[1].trim();
      }
    }

    for (const candidate of candidates) {
      const trimmed = candidate.trim();
      const shortMatch = trimmed.match(shortCodePattern);
      if (shortMatch && shortMatch[1]) {
        return shortMatch[1].trim();
      }
    }

    return null;
  }

  private extractIngredientValues(
    ocrLines: string[],
    textDetections: TextDetection[],
  ): Partial<Record<BatchFieldKey, string>> {
    const values: Partial<Record<BatchFieldKey, string>> = {};
    const orderedLines = this.orderLines(textDetections, ocrLines);

    for (const matcher of this.ingredientMatchers) {
      for (const line of orderedLines) {
        const nextValue = this.findNumberForIngredient(line, matcher.patterns);
        if (nextValue !== null) {
          values[matcher.key] = nextValue;
          break;
        }
      }
    }

    return values;
  }

  private orderLines(textDetections: TextDetection[], fallbackLines: string[]): string[] {
    if (!textDetections.length) {
      return fallbackLines;
    }

    return [...textDetections]
      .sort((left, right) => left.topLeft[1] - right.topLeft[1] || left.topLeft[0] - right.topLeft[0])
      .map((item) => item.text.trim())
      .filter((item) => item.length > 0);
  }

  private findNumberForIngredient(line: string, patterns: string[]): string | null {
    const escapedPatterns = patterns.map((pattern) => pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const joinedPatterns = '(?:' + escapedPatterns.join('|') + ')';
    const normalizedLine = line.toLowerCase();
    const patternAfterLabel = new RegExp(
      joinedPatterns + '[^a-z0-9]{0,20}([a-z0-9./ -]{1,40})',
      'i',
    );
    const patternBeforeLabel = new RegExp(
      '([a-z0-9./ -]{1,40})[^a-z0-9]{0,8}' + joinedPatterns,
      'i',
    );

    const afterMatch = normalizedLine.match(patternAfterLabel);
    if (afterMatch && afterMatch[1]) {
      return afterMatch[1].trim();
    }

    const beforeMatch = normalizedLine.match(patternBeforeLabel);
    if (beforeMatch && beforeMatch[1]) {
      return beforeMatch[1].trim();
    }

    return null;
  }

  private createDefaultForm(): BatchForm {
    return {
      dvBatchNumber: '',
      manufacturedDate: new Date().toISOString().slice(0, 10),
      cheese: '',
      butter: '',
      sugar: '',
      vanilla: '',
      cocoaPowder: '',
      coatingCompoundChocolate: '',
      coconutOil: '',
      milk: '',
      lecithin: '',
      salt: '',
      other: '',
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

  private async handleScanError(error: unknown, fallbackMessage: string): Promise<void> {
    const message = error instanceof Error ? error.message : fallbackMessage;
    await this.presentToast(message || fallbackMessage, 'danger');
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2600,
      position: 'top',
    });

    await toast.present();
  }

  private async copyText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to the textarea fallback.
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.setAttribute('readonly', 'true');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);
      return copied;
    } catch {
      return false;
    }
  }
}
