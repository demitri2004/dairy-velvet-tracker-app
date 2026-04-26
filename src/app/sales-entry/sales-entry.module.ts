import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SalesEntryPageRoutingModule } from './sales-entry-routing.module';
import { SalesEntryPage } from './sales-entry.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SalesEntryPageRoutingModule],
  declarations: [SalesEntryPage],
  exports: [SalesEntryPage],
})
export class SalesEntryPageModule {}
