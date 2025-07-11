import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppColors } from '../../../utils/constants';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { DEFAULT_BUTTON_CONFIG } from '../../interfaces/default-button-config.constants';

@Component({
  selector: 'app-filled-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './filled-button.component.html',
  styleUrls: ['./filled-button.component.scss'],
})
export class FilledButtonComponent {
  @Input() filledButtonConfig: ButtonConfig = {};

  @Output() onClick = new EventEmitter<Event>();

  gradientFrom: string = AppColors.globalPrimaryColor;
  gradientTo: string = AppColors.globalSecondaryColor;
  config: Required<ButtonConfig> = { ...DEFAULT_BUTTON_CONFIG };

  ngOnInit() {
    this.config = { ...DEFAULT_BUTTON_CONFIG, ...this.filledButtonConfig };
    document.documentElement.style.setProperty('--filled-btn-primary', this.gradientFrom);
    document.documentElement.style.setProperty('--filled-btn-secondary', this.gradientTo);
  }

  get validFontWeight(): string {
    return this.config.fontWeight?.toString() || '400';
  }

  get hasLabel(): boolean {
    return this.config.label?.trim() !== '';
  }

  get isIconLeft(): boolean {
    return this.config.imagePosition === 'left' && this.hasLabel;
  }

  get isIconRight(): boolean {
    return this.config.imagePosition === 'right' && this.hasLabel;
  }
}
