import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MilesEntryPage } from './miles-entry.page';

const routes: Routes = [
  {
    path: '',
    component: MilesEntryPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MilesEntryPageRoutingModule {}
