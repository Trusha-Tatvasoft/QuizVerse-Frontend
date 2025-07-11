import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppColors } from '../../../utils/constants';
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { DEFAULT_BUTTON_CONFIG } from '../../interfaces/default-button-config.constants';

@Component({
  selector: 'app-text-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './text-button.component.html',
  styleUrl: './text-button.component.scss',
})
export class TextButtonComponent {
  @Input() textButtonConfig: ButtonConfig = {};

  @Output() buttonClicked = new EventEmitter<Event>();

  config: Required<ButtonConfig> = { ...DEFAULT_BUTTON_CONFIG };

  ngOnInit() {
    this.config = { ...DEFAULT_BUTTON_CONFIG, ...this.textButtonConfig };
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
