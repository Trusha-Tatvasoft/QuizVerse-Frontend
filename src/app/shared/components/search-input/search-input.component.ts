import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent implements OnInit, OnChanges {
  @Input() placeholder?: string;
  @Input() control!: FormControl;
  @Input() borderClass?: string;

  @Output() search = new EventEmitter<string>();

  ngOnInit(): void {
    this.ensureDefaults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ensureDefaults();
  }

  ensureDefaults() {
    if (this.placeholder === undefined || this.placeholder === null) {
      this.placeholder = 'Search...';
    }

    if (!this.control) {
      this.control = new FormControl('');
    }

    if (!this.borderClass) {
      this.borderClass = 'search-purple';
    }
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.search.emit(value);
  }
}
