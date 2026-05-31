import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AppShellPage } from './app-shell.page';
import { TimeEntryPageModule } from '../time-entry/time-entry.module';
import { SalesEntryPageModule } from '../sales-entry/sales-entry.module';
import { PlaceholderPageModule } from '../placeholder/placeholder.module';
import { MilesEntryPageModule } from '../miles-entry/miles-entry.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TimeEntryPageModule,
    SalesEntryPageModule,
    PlaceholderPageModule,
    MilesEntryPageModule,
  ],
  declarations: [AppShellPage],
  exports: [AppShellPage],
})
export class AppShellPageModule {}
