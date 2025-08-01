import { Component, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { defaultButtonConfig } from '../../interfaces/default-button-config.constants';

@Component({
  selector: 'app-filled-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './filled-button.component.html',
  styleUrls: ['./filled-button.component.scss'],
})
export class FilledButtonComponent {
  @Input() filledButtonConfig: ButtonConfig = {};
  @Output() buttonClicked = new EventEmitter<Event>();
  config: Required<ButtonConfig> = { ...defaultButtonConfig };
  private readonly elRef = inject(ElementRef);

  ngOnInit() {
    this.config = { ...defaultButtonConfig, ...this.filledButtonConfig };
    this.elRef.nativeElement.style.setProperty('--font-weight', this.validFontWeight);
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
