import { Component, Input } from '@angular/core';
import { ProgressBarComponent } from '../../../../../shared/components/progress-bar/progress-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { RankProgress } from '../../interfaces/rank-progress.interface';

@Component({
  selector: 'app-rank-progress-card',
  imports: [[ProgressBarComponent, MatIconModule]],
  templateUrl: './rank-progress-card.component.html',
  styleUrls: ['./rank-progress-card.component.scss'],
})
export class RankProgressCardComponent {
  @Input() rankData: RankProgress;
}
