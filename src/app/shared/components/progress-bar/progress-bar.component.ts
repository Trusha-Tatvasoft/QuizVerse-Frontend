import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent {
  @Input() percentage: number = 50;
  @Input() color: 'primary' | 'secondary' | 'black' = 'primary';

  private readonly elRef = inject(ElementRef);

  ngOnInit() {
    this.elRef.nativeElement.style.setProperty('--progress-bar-percentage', this.percentage + '%');
    this.elRef.nativeElement.style.setProperty('--progress-bar-color', this.progressbarColor);
  }

  //set progressbar color as per input color
  get progressbarColor(): string {
    switch (this.color) {
      case 'primary':
        return 'var(--global-primary-color)';
      case 'secondary':
        return 'var(--global-secondary-color)';
      case 'black':
        return 'var(--black-color)';
      default:
        return 'var(--global-primary-color)';
    }
  }
}
