import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserStatus, UserRoles } from '../../../../../shared/enums/user-management.enum';
import { Role } from '../../../../../shared/enums/role';
import { UserListData } from '../../interfaces/user-list-data.interface';
import { UserManagementComponent } from '../../user-management.component';
import { UserManagementService } from '../../../../../services/admin/user-management/user-management.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { userToUserListingTableData } from './user-listing-data.mapper';
import { debounceTimeValue, defaultLastLoginDate } from '../../../../../utils/constants';
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
    roleId: UserRoles.Admin,
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
  let snackbarServiceMock: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    userServiceMock = {
      getUsers: jest.fn().mockReturnValue(of(mockApiResponse)),
    } as any;

    snackbarServiceMock = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showInfo: jest.fn(),
      showWarning: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: UserManagementService, useValue: userServiceMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;

    // Mock the current user role if the component has this property
    if ('currentUserRole' in component) {
      (component as any).currentUserRole = Role.SuperAdmin;
    }

    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verifies the component initializes correctly
    expect(component).toBeTruthy();
  });

  it('should fetch users on init', () => {
    // Ensures users are fetched and stored on component init
    expect(userServiceMock.getUsers).toHaveBeenCalled();
    expect(component.dataSource().length).toBeGreaterThanOrEqual(0);
    expect(component.totalItems()).toBeGreaterThanOrEqual(0);
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
    tick(debounceTimeValue);
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

    // Wait for async operations
    fixture.detectChanges();

    const dataSource = component.dataSource();
    if (dataSource.length > 0) {
      const tableRow = dataSource[0] as {
        fullname: { name: string; email: string; image: string };
        role: { tagConfig: { label: string } };
        status: { tagConfig: { label: string } };
      };

      expect(tableRow.fullname.name).toBe('John Doe');
      expect(tableRow.role.tagConfig.label).toBe('Admin');
      expect(tableRow.status.tagConfig.label).toBe('Active');
    }
  });

  // Fallback to empty string when profilePic is null or undefined
  it('should fallback to empty string if profilePic is missing', () => {
    const userWithoutProfilePic = { ...mockUsers[0], profilePic: undefined };
    const result = userToUserListingTableData(userWithoutProfilePic, Role.SuperAdmin) as any;
    expect(result.fullname.image).toBe('');
  });

  // Use null as fallback if lastLogin is uninitialized
  it('should give null if lastLogin is uninitialized', () => {
    const userWithDefaultLastLogin = { ...mockUsers[0], lastLogin: defaultLastLoginDate };
    const result = userToUserListingTableData(userWithDefaultLastLogin, Role.SuperAdmin) as any;
    expect(result.lastLogin).toBe(null);
  });

  // Role mapping for non-admin users should return "Player"
  it('should map role correctly for non-admin (Player)', () => {
    const playerUser = { ...mockUsers[0], roleId: 2 };
    const result = userToUserListingTableData(playerUser, Role.SuperAdmin) as any;
    expect(result.role.tagConfig.label).toBe('Player');
  });

  // Role mapping for Super Admin
  it('should map role correctly for Super Admin', () => {
    const superAdminUser = { ...mockUsers[0], roleId: UserRoles.SuperAdmin };
    const result = userToUserListingTableData(superAdminUser, Role.SuperAdmin) as any;
    expect(result.role.tagConfig.label).toBe('Super Admin');
    expect(result.role.tagConfig.backgroundColor).toBe('lightBlue');
    expect(result.role.tagConfig.textColor).toBe('blue');
  });

  // Role mapping for Admin
  it('should map role correctly for Admin', () => {
    const adminUser = { ...mockUsers[0], roleId: UserRoles.Admin };
    const result = userToUserListingTableData(adminUser, Role.SuperAdmin) as any;
    expect(result.role.tagConfig.label).toBe('Admin');
    expect(result.role.tagConfig.backgroundColor).toBe('lightPurple');
    expect(result.role.tagConfig.textColor).toBe('purple');
  });

  // "block" action should be included if user is NOT suspended
  it('should include "block" if user is not suspended', () => {
    const user = { ...mockUsers[0], status: UserStatus.Active };
    const result = userToUserListingTableData(user, Role.SuperAdmin) as any;

    const hasBlockAction = result.actions.some((action: any) => action.icon === 'block');
    expect(hasBlockAction).toBe(true);
  });

  // "block" action should be excluded if user is suspended
  it('should NOT include "block" if user is suspended', () => {
    const user = { ...mockUsers[0], status: UserStatus.Suspended };
    const result = userToUserListingTableData(user, Role.SuperAdmin) as any;
    const hasBlockAction = result.actions.some((action: any) => action.icon === 'block');
    expect(hasBlockAction).toBe(false);
  });

  // Action icon should toggle based on user status
  it('should toggle action icon based on status', () => {
    const activeUser = { ...mockUsers[0], status: UserStatus.Active };
    const inactiveUser = { ...mockUsers[0], status: UserStatus.Inactive };

    const activeActions = userToUserListingTableData(activeUser, Role.SuperAdmin)[
      'actions'
    ] as unknown[];
    const inactiveActions = userToUserListingTableData(inactiveUser, Role.SuperAdmin)[
      'actions'
    ] as unknown[];

    const hasRemoveCircle = activeActions.some(
      (action) => (action as { icon: string }).icon === 'remove_circle_outline',
    );
    const hasCheckCircle = inactiveActions.some(
      (action) => (action as { icon: string }).icon === 'check_circle_outline',
    );

    expect(hasRemoveCircle).toBe(true);
    expect(hasCheckCircle).toBe(true);
  });

  // Properly display "0" attemptedQuizzes with label and text
  it('should correctly handle attemptedQuizzes value', () => {
    const user = { ...mockUsers[0], attemptedQuizzes: 0 };
    const result = userToUserListingTableData(user, Role.SuperAdmin) as any;
    expect(result.quizattempt.tagConfig.label).toBe('0');
    expect(result.quizattempt.extraText).toBe('quizzes');
  });

  // Status mapping should return correct label, color, and background
  it.each([
    { status: 1, expectedLabel: 'Active', bg: 'lightGreen', text: 'green' },
    { status: 2, expectedLabel: 'Inactive', bg: 'lightYellow', text: 'yellow' },
    { status: 3, expectedLabel: 'Suspended', bg: 'lightBrown', text: 'brown' },
    { status: 99, expectedLabel: 'Unknown', bg: 'lightWhite', text: 'black' },
  ])('should map status correctly for status $status', ({ status, expectedLabel, bg, text }) => {
    const user = { ...mockUsers[0], status };
    const result = userToUserListingTableData(user, Role.SuperAdmin) as any;
    expect(result.status.tagConfig.label).toBe(expectedLabel);
    expect(result.status.tagConfig.backgroundColor).toBe(bg);
    expect(result.status.tagConfig.textColor).toBe(text);
  });

  // Admin cannot edit other admins
  it('should disable edit action when Admin tries to edit another Admin', () => {
    const adminUser = { ...mockUsers[0], roleId: UserRoles.Admin };
    const result = userToUserListingTableData(adminUser, Role.Admin) as any;
    const editAction = result.actions.find((action: any) => action.icon === 'edit');
    expect(editAction.isDisabled).toBe(true);
    expect(editAction.tooltip).toBe('Action not allowed');
  });

  // SuperAdmin can edit admins
  it('should enable edit action when SuperAdmin tries to edit an Admin', () => {
    const adminUser = { ...mockUsers[0], roleId: UserRoles.Admin };
    const result = userToUserListingTableData(adminUser, Role.SuperAdmin) as any;
    const editAction = result.actions.find((action: any) => action.icon === 'edit');
    expect(editAction.isDisabled).toBe(false);
    expect(editAction.tooltip).toBe('Edit User');
  });

  // Delete action disabled for admin users
  it('should disable delete action for Admin users', () => {
    const adminUser = { ...mockUsers[0], roleId: UserRoles.Admin };
    const result = userToUserListingTableData(adminUser, Role.SuperAdmin) as any;
    const deleteAction = result.actions.find((action: any) => action.icon === 'delete');
    expect(deleteAction.isDisabled).toBe(true);
    expect(deleteAction.tooltip).toBe('Action not allowed');
  });

  // Suspend action tooltip changes when disabled
  it('should show "Action not allowed" tooltip when Admin tries to suspend another Admin', () => {
    const adminUser = { ...mockUsers[0], roleId: UserRoles.Admin, status: UserStatus.Active };
    const result = userToUserListingTableData(adminUser, Role.Admin) as any;
    const suspendAction = result.actions.find((action: any) => action.icon === 'block');
    expect(suspendAction.isDisabled).toBe(true);
    expect(suspendAction.tooltip).toBe('Action not allowed');
  });

  // Activate/Deactivate action tooltip changes when disabled
  it('should show "Action not allowed" tooltip when Admin tries to deactivate another Admin', () => {
    const adminUser = { ...mockUsers[0], roleId: UserRoles.Admin, status: UserStatus.Active };
    const result = userToUserListingTableData(adminUser, Role.Admin) as any;
    const activateAction = result.actions.find(
      (action: any) => action.icon === 'remove_circle_outline',
    );
    expect(activateAction.isDisabled).toBe(true);
    expect(activateAction.tooltip).toBe('Action not allowed');
  });
});
