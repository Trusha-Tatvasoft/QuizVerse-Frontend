import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { DEFAULT_BUTTON_CONFIG } from '../../interfaces/default-button-config.constants';

/**
 * Filled Button Component
 * ------------------------
 * Reusable filled button component that displays a filled button.
 * The background changes based on the project's primary and secondary colors.
 * Displays only icon, only label, or both, with left or right positioning based on input.
 */
@Component({
  selector: 'app-filled-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './filled-button.component.html',
  styleUrls: ['./filled-button.component.scss'],
})
export class FilledButtonComponent {
  // Input config to customize the button
  @Input() filledButtonConfig: ButtonConfig = {};

  // Emits event when button is clicked
  @Output() buttonClicked = new EventEmitter<Event>();

  // Merged config with default values to ensure all fields are defined
  config: Required<ButtonConfig> = { ...DEFAULT_BUTTON_CONFIG };

  ngOnInit() {
    // Merge incoming config with defaults
    this.config = { ...DEFAULT_BUTTON_CONFIG, ...this.filledButtonConfig };
  }

  // Returns font weight as string for inline styling
  get validFontWeight(): string {
    return this.config.fontWeight?.toString() || '400';
  }

  // Determines if the label should be shown
  get hasLabel(): boolean {
    return this.config.label?.trim() !== '';
  }

  // Returns true if icon should be placed on the left
  get isIconLeft(): boolean {
    return this.config.imagePosition === 'left' && this.hasLabel;
  }

  // Returns true if icon should be placed on the right
  get isIconRight(): boolean {
    return this.config.imagePosition === 'right' && this.hasLabel;
  }
}
