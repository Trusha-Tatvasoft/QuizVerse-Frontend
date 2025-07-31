import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListingComponent } from './user-listing.component';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { By } from '@angular/platform-browser';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';

describe('UserListingComponent', () => {
  let component: UserListingComponent;
  let fixture: ComponentFixture<UserListingComponent>;

  const mockDataSource: TableData[] = [
    {
      fullname: { name: 'John Doe', email: 'john@example.com', image: '' },
      role: {
        tagConfig: {
          id: '1',
          label: 'Admin',
          type: 'static',
          backgroundColor: 'lightPurple',
          textColor: 'purple',
        },
      },
      status: {
        tagConfig: {
          id: '1',
          label: 'Active',
          type: 'static',
          backgroundColor: 'lightGreen',
          textColor: 'green',
        },
      },
      joinDate: '2024-01-01',
      lastActive: '2024-06-01',
      attemptedQuizzes: {
        tagConfig: {
          id: 'quizzes-1',
          label: '5',
          type: 'static',
          backgroundColor: 'white',
          textColor: 'black',
        },
        extraText: 'quizzes',
      },
      actions: ['edit', 'delete'],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListingComponent);
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
    expect(component.tableTitle).toBe('All Users');
    expect(component.tableDescription).toBe('Manage and monitor user accounts');
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
