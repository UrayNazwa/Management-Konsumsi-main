import { Component } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  template: '<app-layout />'
})
export class AppComponent {
  title = 'management-konsumsi-frontend';
}
