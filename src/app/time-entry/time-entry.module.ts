import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TimeEntryPageRoutingModule } from './time-entry-routing.module';
import { TimeEntryPage } from './time-entry.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TimeEntryPageRoutingModule],
  declarations: [TimeEntryPage],
  exports: [TimeEntryPage],
})
export class TimeEntryPageModule {}
