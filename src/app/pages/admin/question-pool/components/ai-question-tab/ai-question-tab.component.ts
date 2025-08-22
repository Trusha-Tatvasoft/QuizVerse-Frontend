import { Component, signal } from '@angular/core';
import { aiQuestionFormTabConfig } from '../../configs/question-pool-tab-config';
import { TabComponent } from '../../../../../shared/components/tab/tab.component';

@Component({
  selector: 'app-ai-question-tab',
  imports: [TabComponent],
  templateUrl: './ai-question-tab.component.html',
  styleUrl: './ai-question-tab.component.scss',
})
export class AiQuestionTabComponent {
  tabs = aiQuestionFormTabConfig;
  selectedIndex = signal(0);

  switchToTab(index: number) {
    this.selectedIndex.set(index);
  }
}
