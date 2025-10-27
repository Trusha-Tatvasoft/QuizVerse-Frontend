import { Component, signal } from '@angular/core';
import { manualQuestionFormTabConfig } from '../../configs/question-pool-tab-config';
import { TabComponent } from '../../../../../shared/components/tab/tab.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manual-question-tab',
  imports: [TabComponent, CommonModule],
  templateUrl: './manual-question-tab.component.html',
  styleUrl: './manual-question-tab.component.scss',
})
export class ManualQuestionTabComponent {
  tabs = manualQuestionFormTabConfig;
  selectedIndex = signal(0);

  switchToTab(index: number) {
    this.selectedIndex.set(index);
  }
}
