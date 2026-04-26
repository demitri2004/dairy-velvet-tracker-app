import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesEntryPage } from './sales-entry.page';

const routes: Routes = [
  {
    path: '',
    component: SalesEntryPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesEntryPageRoutingModule {}
