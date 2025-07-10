import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableComponent } from './shared/components/table/table.component';
import { ColumnDef } from './shared/interfaces/table.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'QuizVerse-Frontend';
  tableDescription = 'Manage and organize questions for quizzes and battles';

  columns: ColumnDef[] = [
    { key: 'questionBlock', label: 'Question', type: 'custom' },
    { key: 'type', label: 'Type', type: 'tag' },
    { key: 'category', label: 'Category', type: 'text', isSortable: true },
    { key: 'difficulty', label: 'Difficulty', type: 'tag' },
  ];

  dataSource = [
    {
      question: 'What is the capital of France?',
      correctAnswer: 'Paris',
      type: 'Multiple Choice',
      category: 'Geography',
      difficulty: 'Easy',
    },
    {
      question: 'What is 2 + 2?',
      correctAnswer: '4',
      type: 'Multiple Choice',
      category: 'Mathematics',
      difficulty: 'Easy',
    },
    {
      question: 'What is the boiling point of water?',
      correctAnswer: '100°C',
      type: 'Short Answer',
      category: 'Science',
      difficulty: 'Medium',
    },
  ];

  actionIcons = [
    { icon: 'visibility', action: 'view', tooltip: 'View' },
    { icon: 'edit', action: 'edit', tooltip: 'Edit' },
    { icon: 'delete', action: 'delete', tooltip: 'Delete', color: 'warn' },
  ];

  totalItems = this.dataSource.length;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
}
