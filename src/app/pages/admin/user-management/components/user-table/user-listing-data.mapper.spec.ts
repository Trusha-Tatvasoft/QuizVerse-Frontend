import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserStatus } from '../../../../../shared/enums/user-management.enum';
import { UserListData } from '../../interfaces/user-list-data.interface';
import { UserManagementComponent } from '../../user-management.component';
import { UserManagementService } from '../../../../../services/admin/user-management/user-management.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { userToUserListingTableData } from './user-listing-data.mapper';
import { DEBOUNCE_TIME, DEFAULT_LAST_LOGIN_DATE } from '../../../../../utils/constants';
import { PaginatedDataResponse } from '../../../../../shared/interfaces/paginated-data-response.interface';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Mock data
const mockUsers: UserListData[] = [
  {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    userName: 'johndoe',
    roleId: 1,
    status: UserStatus.Active,
    createdDate: '2023-01-01T00:00:00Z',
    lastLogin: '2023-01-10T00:00:00Z',
    attemptedQuizzes: 3,
    profilePic: '',
  },
];

const mockPaginatedResponse = {
  totalRecords: 1,
  records: mockUsers,
};

const mockApiResponse: ApiResponse<PaginatedDataResponse<UserListData>> = {
  result: true,
  statusCode: 200,
  message: 'Success',
  data: mockPaginatedResponse,
};

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userServiceMock: jest.Mocked<UserManagementService>;

  beforeEach(async () => {
    userServiceMock = {
      getUsers: jest.fn().mockReturnValue(of(mockApiResponse)),
    } as any;

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [{ provide: UserManagementService, useValue: userServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verifies the component initializes correctly
    expect(component).toBeTruthy();
  });

  it('should fetch users on init', () => {
    // Ensures users are fetched and stored on component init
    expect(userServiceMock.getUsers).toHaveBeenCalledTimes(1);
    expect(component.dataSource().length).toBe(1);
    expect(component.totalItems()).toBe(1);
  });

  it('should call fetchUsers when page changes', () => {
    // Confirms fetchUsers is triggered and pagination updates on page change
    const spy = jest.spyOn(component, 'fetchUsers');
    component.onPageChange({ pageIndex: 1, pageSize: 10 });
    expect(spy).toHaveBeenCalled();
    expect(component.pagination()).toEqual({ pageNumber: 2, pageSize: 10 });
  });

  it('should call fetchUsers when sort changes', () => {
    // Confirms fetchUsers is triggered and sorting updates on sort change
    const spy = jest.spyOn(component, 'fetchUsers');
    component.onSortChange({ active: 'fullName', direction: 'asc' });
    expect(spy).toHaveBeenCalled();
    expect(component.sort()).toEqual({ sortColumn: 'fullName', sortDescending: false });
  });

  it('should call fetchUsers on filter change', () => {
    // Ensures filter change triggers a new fetch
    const spy = jest.spyOn(component, 'fetchUsers');
    component.selectedRole = 1;
    component.selectedStatus = 2;
    component.onFilterChange();
    expect(spy).toHaveBeenCalled();
  });

  it('should debounce and fetch users on search input change after 500ms', fakeAsync(() => {
    // Validates that search input changes are debounced
    const spy = jest.spyOn(component as any, 'fetchUsers');
    component.onSearchInputChange('Jane');
    expect(spy).not.toHaveBeenCalled();
    tick(DEBOUNCE_TIME);
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should correctly apply filters to request payload', () => {
    // Ensures correct request object is built from filters and search term
    component.selectedRole = 1;
    component.selectedStatus = 2;
    component.searchControl.setValue('test');

    const expectedRequest = {
      pageNumber: 1,
      pageSize: 5,
      searchTerm: 'test',
      sortColumn: '',
      sortDescending: false,
      filters: {
        role: 1,
        status: 2,
      },
    };

    component.fetchUsers();
    expect(userServiceMock.getUsers).toHaveBeenLastCalledWith(expectedRequest);
  });

  it('should transform API response to table data using userToUserListingTableData', () => {
    // Validates that API user data is transformed correctly to table format
    component.fetchUsers();
    const tableRow = component.dataSource()[0] as {
      fullname: { name: string; email: string; image: string };
      role: { tagConfig: { label: string } };
      status: { tagConfig: { label: string } };
    };

    expect(tableRow.fullname.name).toBe('John Doe');
    expect(tableRow.role.tagConfig.label).toBe('Admin');
    expect(tableRow.status.tagConfig.label).toBe('Active');
  });

  // Fallback to empty string when profilePic is null or undefined
  it('should fallback to empty string if profilePic is missing', () => {
    const userWithoutProfilePic = { ...mockUsers[0], profilePic: undefined };
    const result = userToUserListingTableData(userWithoutProfilePic) as any;
    expect(result.fullname.image).toBe('');
  });

  // Use null as fallback if lastLogin is uninitialized
  it('should give null if lastLogin is uninitialized', () => {
    const userWithDefaultLastLogin = { ...mockUsers[0], lastLogin: DEFAULT_LAST_LOGIN_DATE };
    const result = userToUserListingTableData(userWithDefaultLastLogin) as any;
    expect(result['lastActive']).toBe(undefined);
  });
  DEFAULT_LAST_LOGIN_DATE;

  // Role mapping for non-admin users should return "Player"
  it('should map role correctly for non-admin (Player)', () => {
    const playerUser = { ...mockUsers[0], roleId: 2 };
    const result = userToUserListingTableData(playerUser) as any;
    expect(result['role'].tagConfig.label).toBe('Player');
  });

  // "block" action should be included if user is NOT suspended
  it('should include "block" if user is not suspended', () => {
    const user = { ...mockUsers[0], status: UserStatus.Active };
    const result = userToUserListingTableData(user) as any;
    expect(result.actions).toContain('block');
  });

  // "block" action should be excluded if user is suspended
  it('should NOT include "block" if user is suspended', () => {
    const user = { ...mockUsers[0], status: UserStatus.Suspended };
    const result = userToUserListingTableData(user) as any;
    expect(result.actions).not.toContain('block');
  });

  // Action icon should toggle based on user status
  it('should toggle action icon based on status', () => {
    const activeUser = { ...mockUsers[0], status: UserStatus.Active };
    const inactiveUser = { ...mockUsers[0], status: UserStatus.Inactive };

    const activeActions = userToUserListingTableData(activeUser)['actions'];
    const inactiveActions = userToUserListingTableData(inactiveUser)['actions'];

    expect(activeActions).toContain('remove_circle_outline');
    expect(inactiveActions).toContain('check_circle_outline');
  });

  // Properly display "0" attemptedQuizzes with label and text
  it('should correctly handle attemptedQuizzes value', () => {
    const user = { ...mockUsers[0], attemptedQuizzes: 0 };
    const result = userToUserListingTableData(user) as any;
    expect(result.quizattempt.tagConfig.label).toBe('0');
    expect(result.quizattempt.extraText).toBe('quizzes');
  });

  // Status mapping should return correct label, color, and background
  it.each([
    { status: 1, expectedLabel: 'Active', bg: 'lightGreen', text: 'green' },
    { status: 2, expectedLabel: 'Inactive', bg: 'lightYellow', text: 'yellow' },
    { status: 3, expectedLabel: 'Suspended', bg: 'lightBrown', text: 'brown' },
    { status: 99, expectedLabel: 'Unknown', bg: 'lightGray', text: 'gray' },
  ])('should map status correctly for status $status', ({ status, expectedLabel, bg, text }) => {
    const user = { ...mockUsers[0], status };
    const result = userToUserListingTableData(user) as any;
    expect(result.status.tagConfig.label).toBe(expectedLabel);
    expect(result.status.tagConfig.backgroundColor).toBe(bg);
    expect(result.status.tagConfig.textColor).toBe(text);
  });
});
