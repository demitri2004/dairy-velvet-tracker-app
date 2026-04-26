import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlaceholderPageRoutingModule } from './placeholder-routing.module';
import { PlaceholderPage } from './placeholder.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PlaceholderPageRoutingModule],
  declarations: [PlaceholderPage],
  exports: [PlaceholderPage],
})
export class PlaceholderPageModule {}
