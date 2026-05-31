import { Component } from '@angular/core';

type AppTab = 'time' | 'sales' | 'tbd' | 'miles';

@Component({
  selector: 'app-app-shell',
  templateUrl: './app-shell.page.html',
  styleUrls: ['./app-shell.page.scss'],
  standalone: false,
})
export class AppShellPage {
  selectedTab: AppTab = 'time';

  setTab(tab: AppTab): void {
    this.selectedTab = tab;
  }

  get title(): string {
    switch (this.selectedTab) {
      case 'sales':
        return 'Sales Tracking';
      case 'tbd':
        return 'Batch Tracking';
      case 'miles':
        return 'Miles Tracking';
      case 'time':
      default:
        return 'Time Tracking';
    }
  }
}
