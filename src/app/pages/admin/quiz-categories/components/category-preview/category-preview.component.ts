import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { activeTagConfig, inActiveTagConfig } from '../../configs/quiz-category-management.config';
import { DatePipe } from '@angular/common';
import { QuizCategoryList } from '../../interface/quiz-category-list-data.interface';

@Component({
  selector: 'app-category-preview',
  imports: [MatIconModule, TagComponent],
  templateUrl: './category-preview.component.html',
  styleUrl: './category-preview.component.scss',
  providers: [DatePipe],
})
export class CategoryPreviewComponent implements OnInit {
  @Input() data: QuizCategoryList = null!;
  @Output() close = new EventEmitter<void>();

  formatedDate!: string;
  ActiveTagConfig = activeTagConfig;
  InActiveTagConfig = inActiveTagConfig;

  private readonly datePipe = inject(DatePipe); // inject DatePipe

  ngOnInit(): void {
    const raw = this.data.createdDate;
    this.formatedDate = this.datePipe.transform(raw, 'yyyy-MM-dd') as string;
  }

  onClose(): void {
    this.close.emit();
  }
}
