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
  @Input() theme: 'primary' | 'secondary' = 'primary';

  private readonly elRef = inject(ElementRef);

  ngOnInit() {
    this.setCSSVariables();
  }

  //set progressbar color as per input color
  get progressbarColor(): string {
    switch (this.theme) {
      case 'primary':
        return 'var(--global-primary-color)';
      case 'secondary':
        return 'var(--global-secondary-color)';
      default:
        return 'var(--global-primary-color)';
    }
  }

  //validation for percentage value
  get validPercentage(): number {
    if (this.percentage > 100) return 100;
    else if (this.percentage < 0) return 0;
    else return this.percentage;
  }

  //set CSS variables for progress bar
  private setCSSVariables() {
    this.elRef.nativeElement.style.setProperty(
      '--progress-bar-percentage',
      this.validPercentage + '%',
    );
    this.elRef.nativeElement.style.setProperty('--progress-bar-color', this.progressbarColor);
  }
}
