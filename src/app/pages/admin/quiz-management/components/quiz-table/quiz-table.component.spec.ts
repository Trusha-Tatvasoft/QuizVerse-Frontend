import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizTableComponent } from './quiz-table.component';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { By } from '@angular/platform-browser';
import { TableComponent } from '../../../../../shared/components/table/table.component';

describe('QuizTableComponent', () => {
  let component: QuizTableComponent;
  let fixture: ComponentFixture<QuizTableComponent>;

  const mockDataSource: TableData[] = [
    {
      id: 9,
      quizTitle: 'Gk Quizes',
      categoryName: 'Technology',
      quizDifficultyLevel: {
        tagConfig: {
          id: 'Medium',
          label: 'Medium',
          type: 'static',
          backgroundColor: 'lightYellow',
          textColor: 'orange',
        },
      },
      totalQuestion: 10,
      noOfPersonAttempted: 0,
      status: {
        tagConfig: {
          id: '1',
          label: 'Active',
          type: 'static',
          backgroundColor: 'lightGreen',
          textColor: 'green',
        },
      },
      createdDate: '2025-08-11T18:12:11.32978',
      actions: [
        { icon: 'visibility', tooltip: 'Preview Quiz' },
        { icon: 'edit', tooltip: 'Edit Quiz' },
        { icon: 'delete', tooltip: 'Delete Quiz' },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizTableComponent);
    component = fixture.componentInstance;

    // Set input values
    component.dataSource = mockDataSource;
    component.totalItems = mockDataSource.length;

    fixture.detectChanges();
  });

  // Verifies the component is created successfully
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Ensures columns and pagination configs are initialized
  it('should initialize column and pagination configs', () => {
    expect(component.columns).toBeDefined();
    expect(component.paginationConfig).toBeDefined();
  });

  // Confirms title and description are set as expected
  it('should set correct table title and description', () => {
    expect(component.tableTitle).toBe('All Quizzes');
    expect(component.tableDescription).toBe('Manage existing quizzes and their settings');
  });

  // Validates inputs are bound correctly to the component
  it('should bind inputs correctly', () => {
    expect(component.dataSource).toEqual(mockDataSource);
    expect(component.totalItems).toBe(mockDataSource.length);
  });

  // Checks that the TableComponent is rendered in the template
  it('should render the TableComponent', () => {
    const tableEl = fixture.debugElement.query(By.directive(TableComponent));
    expect(tableEl).toBeTruthy();
  });

  // Ensures actionClick emits with the correct payload
  it('should emit actionClick with correct data', () => {
    const emitSpy = jest.spyOn(component.actionClick, 'emit');
    const mockAction = { action: 'edit', row: mockDataSource[0] };

    component.onActionClick(mockAction);

    expect(emitSpy).toHaveBeenCalledWith(mockAction);
  });

  // Ensures pageChange emits with the correct payload
  it('should emit pageChange with correct data', () => {
    const emitSpy = jest.spyOn(component.pageChange, 'emit');
    const mockPage = { pageIndex: 2, pageSize: 20 };

    component.onPageChange(mockPage);

    expect(emitSpy).toHaveBeenCalledWith(mockPage);
  });

  // Ensures sortChange emits with the correct payload
  it('should emit sortChange with correct data', () => {
    const emitSpy = jest.spyOn(component.sortChange, 'emit');
    const sortEvent = { active: 'fullname', direction: 'asc' };

    component.onSortChange(sortEvent);

    expect(emitSpy).toHaveBeenCalledWith(sortEvent);
  });
});
