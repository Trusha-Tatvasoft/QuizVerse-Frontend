import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchInputComponent } from './search-input.component';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SearchInputComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search value on input', (done) => {
    component.search.subscribe((value) => {
      expect(value).toBe('test query');
      done();
    });

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.value = 'test query';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  });

  it('should display the placeholder', () => {
    component.placeholder = 'Search quizzes...';
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.placeholder).toBe('Search quizzes...');
  });
});
