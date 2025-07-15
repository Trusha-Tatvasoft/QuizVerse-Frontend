import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TagComponent } from '../tag/tag.component';
import { CardInputConfig } from '../../interfaces/card-component.interface';

@Component({
  selector: 'app-card',
  imports: [CommonModule, MatCardModule, MatIconModule, TagComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() cardConfig: CardInputConfig = {
    title: '',
    value: '',
    subtitle: '',
    icon: '',
    tag: {
      id: '',
      label: '',
      type: 'static',
      isSelected: false,
      hasBorder: false,
      backgroundColor: 'black',
      textColor: 'white',
    },
    subtitleColor: 'purple',
    valueColor: 'black',
    iconColor: 'purple',
  };

  get valueColorClass(): string {
    return `text-${this.cardConfig.valueColor}`;
  }

  get subtitleColorClass(): string {
    return `text-${this.cardConfig.subtitleColor}`;
  }

  get iconColorClass(): string {
    return `text-${this.cardConfig.iconColor}`;
  }

  get hasRightElement(): boolean {
    return !!(this.cardConfig.icon || this.cardConfig.tag);
  }

  get showIcon(): boolean {
    return !!this.cardConfig.icon && !this.cardConfig.tag;
  }

  get showTag(): boolean {
    return !!this.cardConfig.tag;
  }
}
