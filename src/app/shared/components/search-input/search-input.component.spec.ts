import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchInputComponent } from './search-input.component';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';

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

  it('should update control value on input', () => {
    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.value = 'hello world';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.control.value).toBe('hello world');
  });

  it('should have default placeholder text', () => {
    component.placeholder = undefined!;
    component.ensureDefaults();
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.placeholder).toBe('Search...');
  });

  it('should have default FormControl', () => {
    component.control = undefined!;
    component.ensureDefaults();
    fixture.detectChanges();

    expect(component.control).toBeDefined();
    expect(component.control.value).toBe('');
  });

  it('should have default borderClass', () => {
    component.borderClass = undefined!;
    component.ensureDefaults();
    fixture.detectChanges();

    expect(component.borderClass).toBe('search-purple');
  });

  it('should accept custom placeholder', () => {
    component.placeholder = 'Find your item';
    component.ensureDefaults();
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.placeholder).toBe('Find your item');
  });

  it('should accept custom FormControl', () => {
    const customControl = new FormControl('custom value');
    component.control = customControl;
    component.ensureDefaults();
    fixture.detectChanges();

    expect(component.control.value).toBe('custom value');
  });

  it('should accept custom borderClass', () => {
    component.borderClass = 'custom-border';
    component.ensureDefaults();
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('.custom-border'));
    expect(formField).toBeTruthy();
  });

  it('should handle disabled FormControl', () => {
    component.control.disable();
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.disabled).toBe(true);
  });

  it('should render search icon', () => {
    const iconEl = fixture.debugElement.query(By.css('mat-icon'));
    expect(iconEl).toBeTruthy();
    expect(iconEl.nativeElement.textContent.trim()).toBe('search');
  });

  it('should have input with correct type', () => {
    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.type).toBe('text');
  });

  it('should set default placeholder when placeholder input changes to undefined via ngOnChanges', () => {
    // Initially, set a custom placeholder
    component.placeholder = 'Initial Placeholder';
    fixture.detectChanges();
    expect(component.placeholder).toBe('Initial Placeholder');

    // Simulate input becoming undefined
    component.placeholder = undefined!;

    component.ngOnChanges({
      placeholder: new SimpleChange('Initial Placeholder', undefined, false),
    });

    expect(component.placeholder).toBe('Search...');
  });
});
