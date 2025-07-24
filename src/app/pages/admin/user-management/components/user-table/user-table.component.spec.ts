import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTableComponent } from './user-table.component';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { By } from '@angular/platform-browser';

describe('UserTableComponent', () => {
  let component: UserTableComponent;
  let fixture: ComponentFixture<UserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize columns config', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBeGreaterThan(0);
    expect(component.columns[0].key).toBe('user');
  });

  it('should initialize pagination config', () => {
    expect(component.paginationConfig).toBeDefined();
    expect(component.paginationConfig.applyPaginator).toBe(true);
  });

  it('should set tableTitle and tableDescription', () => {
    expect(component.tableTitle).toBe('All Users');
    expect(component.tableDescription).toBe('Manage and monitor user accounts');
  });

  it('should have a non-empty dataSource with correct length', () => {
    expect(component.dataSource).toBeDefined();
    expect(component.dataSource.length).toBeGreaterThan(0);
    expect(component.totalItems).toBe(component.dataSource.length);
  });

  it('should render the TableComponent', () => {
    const tableDebugElement = fixture.debugElement.query(By.directive(TableComponent));
    expect(tableDebugElement).toBeTruthy();
  });

  it('should call onActionClick with correct parameters', () => {
    const mockRow = component.dataSource[0];
    const action = 'edit';

    const spy = jest.spyOn(component, 'onActionClick');
    component.onActionClick({ action, row: mockRow });

    expect(spy).toHaveBeenCalledWith({ action, row: mockRow });
  });

  it('should call onPageChange with correct parameters', () => {
    const pageEvent = { pageIndex: 1, pageSize: 10 };

    const spy = jest.spyOn(component, 'onPageChange');
    component.onPageChange(pageEvent);

    expect(spy).toHaveBeenCalledWith(pageEvent);
  });

  it('should call onSortChange with correct parameters', () => {
    const sortEvent = { active: 'user', direction: 'asc' };

    const spy = jest.spyOn(component, 'onSortChange');
    component.onSortChange(sortEvent);

    expect(spy).toHaveBeenCalledWith(sortEvent);
  });
});
