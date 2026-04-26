import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeEntryPage } from './time-entry.page';

const routes: Routes = [
  {
    path: '',
    component: TimeEntryPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimeEntryPageRoutingModule {}
