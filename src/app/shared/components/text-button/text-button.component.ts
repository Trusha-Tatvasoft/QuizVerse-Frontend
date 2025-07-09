import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppColors } from '../../../utils/constants';
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-outline-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './text-button.component.html',
  styleUrl: './text-button.component.scss',
})
export class TextButtonComponent {
  @Input() disabled: boolean = false;
  @Input() imageSrc: string = '';
  @Input() matIcon: string = '';
  @Input() imagePosition: 'left' | 'right' = 'left';
  @Input() label: string = 'Button';
  @Input() fontWeight: number = 500;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() iconFontSet: 'material-icons-outlined' | 'material-icons' = 'material-icons';

  @Output() onClick = new EventEmitter<Event>();

  ngOnInit() {
    document.documentElement.style.setProperty('--outline-primary', AppColors.globalSecondaryColor);
  }

  get validFontWeight(): string {
    return this.fontWeight?.toString() || '400';
  }
}
