import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCategoryTableComponent } from './quiz-category-table.component';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';
import { By } from '@angular/platform-browser';

describe('QuizCategoryTableComponent', () => {
  let component: QuizCategoryTableComponent;
  let fixture: ComponentFixture<QuizCategoryTableComponent>;

  const mockTableData: TableData[] = [
    {
      categoryName: { name: 'Math', icon: 'category' },
      description: 'Math quizzes',
      quizCount: {
        tagConfig: {
          id: 'quizCount-1',
          label: '10 quizzes',
          type: 'static',
          backgroundColor: 'light-gray-color',
          textColor: 'black',
          hasBorder: true,
        },
      },
      status: {
        tagConfig: {
          id: 'active',
          label: 'Active',
          type: 'static',
          backgroundColor: 'lightGreen',
          textColor: 'green',
        },
      },
      createdDate: '2025-08-01T00:00:00Z',
      actions: ['edit', 'delete'],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCategoryTableComponent, TableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCategoryTableComponent);
    component = fixture.componentInstance;

    component.dataSource = mockTableData;
    component.totalItems = 1;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the input table data', () => {
    expect(component.dataSource.length).toBe(1);
    expect(component.dataSource).toEqual(mockTableData);
  });

  it('should emit actionClick event', () => {
    const action = { action: 'edit', row: mockTableData[0] };
    jest.spyOn(component.actionClick, 'emit');

    component.onActionClick(action);
    expect(component.actionClick.emit).toHaveBeenCalledWith(action);
  });

  it('should emit pageChange event', () => {
    const event = { pageIndex: 1, pageSize: 10 };
    jest.spyOn(component.pageChange, 'emit');

    component.onPageChange(event);
    expect(component.pageChange.emit).toHaveBeenCalledWith(event);
  });

  it('should emit sortChange event', () => {
    const sortEvent = { active: 'categoryName', direction: 'asc' };
    jest.spyOn(component.sortChange, 'emit');

    component.onSortChange(sortEvent);
    expect(component.sortChange.emit).toHaveBeenCalledWith(sortEvent);
  });
});
