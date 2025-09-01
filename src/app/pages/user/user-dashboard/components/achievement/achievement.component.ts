import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Achievement, dummyAchievement } from '../../interfaces/achievement.interface';
import { viewAllAchievementButtonConfig } from '../../configs/dashboard-buttons.config';
import { TextButtonComponent } from '../../../../../shared/components/text-button/text-button.component';
import { Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';

@Component({
  selector: 'app-achievement',
  imports: [MatIconModule, CommonModule, TextButtonComponent],
  templateUrl: './achievement.component.html',
  styleUrl: './achievement.component.scss',
})
export class AchievementComponent implements OnInit {
  private readonly router = inject(Router);
  achievements: Achievement[];
  viewAllAchievementButton = viewAllAchievementButtonConfig;

  ngOnInit(): void {
    this.achievements = dummyAchievement;
  }

  viewAllAchievement(): void {
    const route = `${Navigations.Profile}`;
    this.router.navigate([route], { queryParams: { tab: 1 } });
  }
}
