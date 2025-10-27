import { Component } from '@angular/core';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { battleHeaderConfig, userBattlesLeaderboardTabs } from './configs/user-battles.configs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-battles',
  imports: [TabComponent, PageHeaderComponent],
  templateUrl: './user-battles.component.html',
  styleUrl: './user-battles.component.scss',
})
export class UserBattlesComponent {
  selectedIndex = 0;
  tabs = userBattlesLeaderboardTabs;
  battleHeaderConfig = battleHeaderConfig;

  //  Handles tab selection changes.
  onTabChanged(index: number) {
    this.selectedIndex = index;
  }
}
