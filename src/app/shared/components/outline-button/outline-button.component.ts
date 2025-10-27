import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { defaultButtonConfig } from '../../interfaces/default-button-config.constants';

@Component({
  selector: 'app-outline-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './outline-button.component.html',
  styleUrl: './outline-button.component.scss',
})
export class OutlineButtonComponent implements OnInit, OnChanges {
  @Input() outlineButtonConfig: ButtonConfig = {};
  @Output() buttonClicked = new EventEmitter<Event>();
  config: Required<ButtonConfig> = { ...defaultButtonConfig };
  private readonly elRef = inject(ElementRef);

  ngOnInit() {
    this.config = { ...defaultButtonConfig, ...this.outlineButtonConfig };
    this.elRef.nativeElement.style.setProperty('--font-weight', this.validFontWeight);
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

  ngOnChanges(changes: SimpleChanges) {
    const newConfig = changes['outlineButtonConfig']?.currentValue;
    if (newConfig) {
      this.config = { ...defaultButtonConfig, ...newConfig };
    }
  }
}
