import { Component } from '@angular/core';
import { TabComponent } from '../../../shared/components/tab/tab.component';
import { UserBattlesLeaderboardTabs } from './configs/user-battles.configs';

@Component({
  selector: 'app-user-battles',
  imports: [TabComponent],
  templateUrl: './user-battles.component.html',
  styleUrl: './user-battles.component.scss',
})
export class UserBattlesComponent {
  selectedIndex = 0;
  tabs = UserBattlesLeaderboardTabs;

  //  Handles tab selection changes.
  onTabChanged(index: number) {
    this.selectedIndex = index;
  }
}
