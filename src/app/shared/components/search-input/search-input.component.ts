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

/**
 * SearchInputComponent
 * ---------------------
 * Reusable search input with Material styling and reactive form support.
 */

@Component({
  selector: 'app-search-input',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent implements OnInit, OnChanges {
  /** Input Decorators **/
  @Input() placeholder!: string; /** Placeholder text for the input */
  @Input() control!: FormControl; /** Reactive form control for the input */
  @Input() borderClass?: string; /** Optional CSS class for border styling */

  /** Emits trimmed input value on change */
  @Output() search = new EventEmitter<string>();

  ngOnInit(): void {
    this.ensureDefaults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ensureDefaults();
  }

  /** Sets defaults if values are not provided */
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

  /** Emits the search value on input change */
  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.search.emit(value);
  }
}
