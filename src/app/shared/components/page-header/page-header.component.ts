import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  @Input() icon: string = 'edit';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() backgroundColor: string = '#f9f9f9';
  @Input() textColor: string = '#333';
  @Input() borderColor: string = '#ccc';
  @Input() subtitleColor: string = '#555';
}
