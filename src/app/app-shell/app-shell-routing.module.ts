import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppShellPage } from './app-shell.page';

const routes: Routes = [
  {
    path: '',
    component: AppShellPage,
    children: [
      {
        path: 'time',
        loadChildren: () =>
          import('../time-entry/time-entry.module').then((m) => m.TimeEntryPageModule),
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('../sales-entry/sales-entry.module').then((m) => m.SalesEntryPageModule),
      },
      {
        path: 'tbd',
        loadChildren: () =>
          import('../placeholder/placeholder.module').then((m) => m.PlaceholderPageModule),
      },
      {
        path: '',
        redirectTo: 'time',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppShellPageRoutingModule {}
