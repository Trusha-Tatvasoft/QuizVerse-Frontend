import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { DEFAULT_BUTTON_CONFIG } from '../../interfaces/default-button-config.constants';

/**
 * Text Button Component
 * ------------------------
 * Reusable text button component that displays a button with only text and white background.
 * The label color is black.
 * Supports icon, label, and their left/right positioning based on configuration.
 */
@Component({
  selector: 'app-text-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './text-button.component.html',
  styleUrl: './text-button.component.scss',
})
export class TextButtonComponent {
  /** Input configuration to control icon, label, positioning, and styles */
  @Input() textButtonConfig: ButtonConfig = {};

  /** Emits an event when the button is clicked */
  @Output() buttonClicked = new EventEmitter<Event>();

  /** Final config with defaults merged from input */
  config: Required<ButtonConfig> = { ...DEFAULT_BUTTON_CONFIG };

  /** Lifecycle method to merge default and custom config */
  ngOnInit() {
    this.config = { ...DEFAULT_BUTTON_CONFIG, ...this.textButtonConfig };
    // this.setOutlineTextColor();
  }

  /** Returns the valid font weight as string, defaults to 400 */
  get validFontWeight(): string {
    return this.config.fontWeight?.toString() || '400';
  }

  /** Determines if the button has a label */
  get hasLabel(): boolean {
    return this.config.label?.trim() !== '';
  }

  /** Determines if the icon should appear on the left */
  get isIconLeft(): boolean {
    return this.config.imagePosition === 'left' && this.hasLabel;
  }

  /** Determines if the icon should appear on the right */
  get isIconRight(): boolean {
    return this.config.imagePosition === 'right' && this.hasLabel;
  }
}
