import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionPoolComponent } from './question-pool.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { MatSelectModule } from '@angular/material/select';
import { QuestionPoolListingComponent } from './components/question-pool-listing/question-pool-listing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('QuestionPoolComponent', () => {
  let component: QuestionPoolComponent;
  let fixture: ComponentFixture<QuestionPoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QuestionPoolComponent,
        PageHeaderComponent,
        SearchInputComponent,
        FilledButtonComponent,
        MatSelectModule,
        QuestionPoolListingComponent,
        ReactiveFormsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize config variables', () => {
    expect(component.questionPoolConfig).toBeDefined();
    expect(component.searchInputConfig).toBeDefined();
    expect(component.addQuestionButtonConfig).toBeDefined();
  });

  it('should initialize FormControl with null', () => {
    expect(component.searchControl.value).toBeNull();
  });

  it('should initialize filter selections as undefined', () => {
    expect(component.selectedCategory).toBeUndefined();
    expect(component.selectedDifficulty).toBeUndefined();
    expect(component.selectedType).toBeUndefined();
  });

  it('should render page header component', () => {
    const header = fixture.debugElement.query(By.directive(PageHeaderComponent));
    expect(header).toBeTruthy();
  });

  it('should render search input component', () => {
    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));
    expect(searchInput).toBeTruthy();
  });

  it('should render filled button component', () => {
    const filledButton = fixture.debugElement.query(By.directive(FilledButtonComponent));
    expect(filledButton).toBeTruthy();
  });

  it('should render question pool listing component', () => {
    const table = fixture.debugElement.query(By.directive(QuestionPoolListingComponent));
    expect(table).toBeTruthy();
  });
  it('should call onSearchInputChange without error', () => {
    const value = 'test query';
    expect(() => component.onSearchInputChange(value)).not.toThrow();
  });

  it('should call onFilterChange without error', () => {
    expect(() => component.onFilterChange()).not.toThrow();
  });
});
