import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppColors } from '../../../utils/constants';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { DEFAULT_BUTTON_CONFIG } from '../../interfaces/default-button-config.constants';

/**
 * Outline Button Component
 * ------------------------
 * Reusable outline button component that displays a button with outline and white background.
 * The label color changes based on the project's primary color.
 * Supports icon, label, and their left/right positioning based on configuration.
 */
@Component({
  selector: 'app-outline-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './outline-button.component.html',
  styleUrl: './outline-button.component.scss',
})
export class OutlineButtonComponent {
  /** Input configuration to control icon, label, positioning, and styles */
  @Input() outlineButtonConfig: ButtonConfig = {};

  /** Emits click event when the button is clicked and not disabled */
  @Output() buttonClicked = new EventEmitter<Event>();

  /** Final merged configuration with default values */
  config: Required<ButtonConfig> = { ...DEFAULT_BUTTON_CONFIG };

  /** OnInit lifecycle to merge user config and apply global styles */
  ngOnInit() {
    this.config = { ...DEFAULT_BUTTON_CONFIG, ...this.outlineButtonConfig };
  }

  /** Converts fontWeight number to string; defaults to '400' if not provided */
  get validFontWeight(): string {
    return this.config.fontWeight?.toString() || '400';
  }

  /** Returns true if label is provided and not just whitespace */
  get hasLabel(): boolean {
    return this.config.label?.trim() !== '';
  }

  /** Returns true if icon/image should be on the left of the label */
  get isIconLeft(): boolean {
    return this.config.imagePosition === 'left' && this.hasLabel;
  }

  /** Returns true if icon/image should be on the right of the label */
  get isIconRight(): boolean {
    return this.config.imagePosition === 'right' && this.hasLabel;
  }
}
