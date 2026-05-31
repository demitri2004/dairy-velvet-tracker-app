import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private readonly menuController: MenuController) {}

  openAdmin(): void {
    window.open(environment.adminUrl, '_system');
    void this.menuController.close('main-menu');
  }

  openSheets(): void {
    window.open(environment.sheetsUrl, '_system');
    void this.menuController.close('main-menu');
  }
}
