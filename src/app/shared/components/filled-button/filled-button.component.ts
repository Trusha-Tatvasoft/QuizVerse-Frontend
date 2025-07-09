import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppColors } from '../../../utils/constants';

@Component({
  selector: 'app-filled-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './filled-button.component.html',
  styleUrls: ['./filled-button.component.scss'],
})
export class FilledButtonComponent {
  @Input() disabled: boolean = false;
  @Input() imageSrc: string = '';
  @Input() matIcon: string = '';
  @Input() imagePosition: 'left' | 'right' = 'left';
  @Input() label: string = 'Button';
  @Input() fontWeight: number = 500;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() iconFontSet: 'material-icons-outlined' | 'material-icons' = 'material-icons';

  @Output() onClick = new EventEmitter<Event>();

  gradientFrom = AppColors.globalPrimaryColor;
  gradientTo = AppColors.globalSecondaryColor;

  ngOnInit() {
    document.documentElement.style.setProperty('--filled-btn-primary', this.gradientFrom);
    document.documentElement.style.setProperty('--filled-btn-secondary', this.gradientTo);
  }

  get validFontWeight(): string {
    return this.fontWeight?.toString() || '400';
  }
}
