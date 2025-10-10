import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OutlineButtonComponent } from '../outline-button/outline-button.component';
import { FilledButtonComponent } from '../filled-button/filled-button.component';
import {
  acceptButtonConfig,
  declineButtonConfig,
} from '../../../pages/user/user-dashboard/configs/dashboard-buttons.config';
import { IncomingBattleRequest } from '../../interfaces/incoming-battle-request.interface';
import { TagInputConfig } from '../../interfaces/tag-component.interface';
import { getTagConfigWithDifficulty } from '../../../utils/quiz-crud-common-functions.utils';
import { defaultTagConfig } from '../../../pages/user/quiz-result-page/configs/quiz-result-tag.configs';
import { TagComponent } from '../tag/tag.component';

@Component({
  selector: 'app-incoming-request-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    OutlineButtonComponent,
    FilledButtonComponent,
    TagComponent,
  ],
  templateUrl: './incoming-request-notification.component.html',
  styleUrls: ['./incoming-request-notification.component.scss'],
})
export class IncomingRequestNotificationComponent implements OnInit {
  @Input() request!: IncomingBattleRequest;
  @Output() accept = new EventEmitter<IncomingBattleRequest>();
  @Output() decline = new EventEmitter<IncomingBattleRequest>();
  @Output() dismiss = new EventEmitter<IncomingBattleRequest>();

  acceptButtonConfig = acceptButtonConfig;
  declineButtonConfig = declineButtonConfig;

  isVisible = false; // controls slide-in animation
  isImageError = false;
  difficultyTag: TagInputConfig = defaultTagConfig;

  ngOnInit(): void {
    // Trigger entrance animation after render
    setTimeout(() => (this.isVisible = true), 50);
    if (this.request?.battleDifficulty) {
      this.difficultyTag = getTagConfigWithDifficulty(this.request.battleDifficulty);
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    return words.length === 1
      ? words[0].charAt(0).toUpperCase()
      : words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }

  getInitialsColorClass(name: string): string {
    if (!name) return 'bg-avatar-0';
    const colorsCount = 12;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorsCount;
    return `bg-avatar-${index}`;
  }

  onImageError(): void {
    this.isImageError = true;
  }

  onAccept(): void {
    this.startHideAnimation(() => this.accept.emit(this.request));
  }

  onDecline(): void {
    this.startHideAnimation(() => this.decline.emit(this.request));
  }

  onDismiss(): void {
    this.startHideAnimation(() => this.dismiss.emit(this.request));
  }

  startHideAnimation(callback: () => void): void {
    if (!this.isVisible) return;
    this.isVisible = false;

    setTimeout(() => callback(), 400);
  }
}
