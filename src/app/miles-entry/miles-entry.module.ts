import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MilesEntryPageRoutingModule } from './miles-entry-routing.module';
import { MilesEntryPage } from './miles-entry.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MilesEntryPageRoutingModule],
  declarations: [MilesEntryPage],
  exports: [MilesEntryPage],
})
export class MilesEntryPageModule {}
