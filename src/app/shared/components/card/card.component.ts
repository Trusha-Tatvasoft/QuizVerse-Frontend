import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() status: string = '';
  @Input() subtitleColor:
    | 'black'
    | 'green'
    | 'red'
    | 'blue'
    | 'purple'
    | 'white'
    | 'gray'
    | 'orange'
    | 'yellow' = 'purple';
  @Input() valueColor:
    | 'black'
    | 'green'
    | 'red'
    | 'blue'
    | 'purple'
    | 'white'
    | 'gray'
    | 'orange'
    | 'yellow' = 'black';
  @Input() backgroundColor:
    | 'black'
    | 'green'
    | 'red'
    | 'blue'
    | 'purple'
    | 'white'
    | 'gray'
    | 'orange'
    | 'yellow' = 'white';

  private readonly colorMap: Record<string, string> = {
    black: '#000000',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    white: '#ffffff',
    gray: '#6b7280',
    orange: '#f97316',
    yellow: '#eab308',
  };

  private resolveColor(color: string, fallback: string): string {
    const lower = color?.toLowerCase();
    return this.colorMap[lower] || this.colorMap[fallback];
  }

  get resolvedSubtitleColor(): string {
    return this.resolveColor(this.subtitleColor, 'purple');
  }

  get resolvedValueColor(): string {
    return this.resolveColor(this.valueColor, 'black');
  }

  get resolvedBackgroundColor(): string {
    return this.resolveColor(this.backgroundColor, 'white');
  }

  get hasRightElement(): boolean {
    return !!(this.icon || this.status);
  }

  get showIcon(): boolean {
    return !!this.icon && !this.status;
  }

  get showStatus(): boolean {
    return !!this.status;
  }

  getStatusBackgroundColor(): string {
    const hex = this.resolvedSubtitleColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  }

  getCardStyles(): any {
    return {
      'background-color': this.resolvedBackgroundColor,
    };
  }
}
