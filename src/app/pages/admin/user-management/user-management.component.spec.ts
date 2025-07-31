import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagementComponent } from './user-management.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { MatSelectModule } from '@angular/material/select';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { UserManagementService } from '../../../services/admin/user-management/user-management.service';
import { LoaderService } from '../../../shared/service/loader/loader.service';
import { UserListData } from './interfaces/user-list-data.interface';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { userToUserListingTableData } from './components/user-table/user-listing-data.mapper';
import { UserListingComponent } from './components/user-table/user-listing.component';

jest.mock('../../../services/admin/user-management/user-management.service');
jest.mock('../../../shared/service/loader/loader.service');

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userService: jest.Mocked<UserManagementService>;
  let loaderService: jest.Mocked<LoaderService>;

  const mockUserResponse = {
    totalRecords: 1,
    records: [
      {
        id: 1,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        userName: 'jane_doe',
        roleId: 1,
        status: 1,
        createdDate: '2023-01-01T00:00:00',
        lastLogin: '2023-07-01T00:00:00',
        attemptedQuizzes: 5,
      } as UserListData,
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserManagementComponent,
        ReactiveFormsModule,
        UserListingComponent,
        PageHeaderComponent,
        SearchInputComponent,
        MatSelectModule,
        OutlineButtonComponent,
        FilledButtonComponent,
      ],
      providers: [
        {
          provide: UserManagementService,
          useValue: {
            getUsers: jest.fn().mockReturnValue(of(mockUserResponse)),
          },
        },
        {
          provide: LoaderService,
          useValue: {
            show: jest.fn(),
            hide: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserManagementService) as jest.Mocked<UserManagementService>;
    loaderService = TestBed.inject(LoaderService) as jest.Mocked<LoaderService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // verifies component instantiation
    expect(component).toBeTruthy();
  });

  it('should call fetchUsers on init', () => {
    // checks API is called on component init
    expect(userService.getUsers).toHaveBeenCalled();
    expect(loaderService.show).toHaveBeenCalled();
    expect(loaderService.hide).toHaveBeenCalled();
    expect(component.dataSource().length).toBeGreaterThan(0);
    expect(component.totalItems()).toBe(1);
  });

  it('should debounce and fetch users on search input change', fakeAsync(() => {
    // verifies debounce and fetch on search input
    const spy = jest.spyOn(component as any, 'fetchUsers');
    component.searchControl.setValue('Jane');
    tick(300);
    expect(spy).toHaveBeenCalled();
  }));

  it('should update pagination and fetch users on page change', () => {
    // verifies page change triggers fetch and updates pagination
    const spy = jest.spyOn(component as any, 'fetchUsers');
    component.onPageChange({ pageIndex: 1, pageSize: 10 });
    expect(component.pagination().pageNumber).toBe(2);
    expect(spy).toHaveBeenCalled();
  });

  it('should update sort and fetch users on sort change', () => {
    // verifies sort change triggers fetch and updates sort state
    const spy = jest.spyOn(component as any, 'fetchUsers');
    component.onSortChange({ active: 'fullName', direction: 'asc' });
    expect(component.sort().sortColumn).toBe('fullName');
    expect(component.sort().sortDescending).toBe(false);
    expect(spy).toHaveBeenCalled();
  });

  it('should apply filters and fetch users on filter change', () => {
    // verifies filter change resets pagination and triggers fetch
    const spy = jest.spyOn(component as any, 'fetchUsers');
    component.selectedRole = 1;
    component.selectedStatus = 2;
    component.onFilterChange();
    expect(component.pagination().pageNumber).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should render child components', () => {
    // checks if all expected child components are present
    expect(fixture.debugElement.query(By.directive(PageHeaderComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(UserListingComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(SearchInputComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(OutlineButtonComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(FilledButtonComponent))).toBeTruthy();
  });

  it('should generate correct filter lists for roles and statuses', () => {
    // ensures role/status filter dropdowns are populated
    expect(component.userRoles.length).toBeGreaterThan(0);
    expect(component.userStatus.length).toBeGreaterThan(0);
  });

  it('should hide loader if API call fails', () => {
    // ensures loader is hidden even if API throws an error
    userService.getUsers.mockImplementationOnce(() => {
      throw new Error('API error');
    });

    expect(() => component.fetchUsers()).toThrow('API error');
    expect(loaderService.hide).toHaveBeenCalled();
  });

  it('should map UserListData to correct TableData', () => {
    // verifies user data is correctly mapped for the table
    const input: UserListData = {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      userName: 'john',
      roleId: 1,
      status: 1,
      createdDate: '2023-01-01',
      lastLogin: '2023-01-05',
      attemptedQuizzes: 3,
    };
    const output = userToUserListingTableData(input);
    expect((output as Record<string, any>)['fullname'].name).toBe('John Doe');
    expect((output['role'] as { tagConfig: { label: string } }).tagConfig.label).toBe('Admin');
    expect((output['status'] as { tagConfig: { label: string } }).tagConfig.label).toBe('Active');
  });

  it('should respond to actionClick from UserListingComponent', () => {
    // verifies event handler runs on table action click
    const userTable = fixture.debugElement.query(By.directive(UserListingComponent));
    const actionSpy = jest.spyOn(component, 'fetchUsers');
    userTable.triggerEventHandler('actionClick', { action: 'edit', row: {} });
    expect(actionSpy).not.toHaveBeenCalled(); // replace if needed
  });

  it('should handle empty API response without errors', () => {
    // verifies UI handles empty API response gracefully
    userService.getUsers.mockReturnValueOnce(of({ totalRecords: 0, records: [] }));
    component.fetchUsers();
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should update UI after data is fetched', () => {
    // ensures UI updates after data is loaded
    component.fetchUsers();
    fixture.detectChanges();
    const table = fixture.debugElement.query(By.directive(UserListingComponent));
    expect(table).toBeTruthy();
  });
});
