import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagementComponent } from './user-management.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { MatSelectModule } from '@angular/material/select';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { UserManagementService } from '../../../services/admin/user-management/user-management.service';
import { UserListData } from './interfaces/user-list-data.interface';
import { userToUserListingTableData } from './components/user-table/user-listing-data.mapper';
import { UserListingComponent } from './components/user-table/user-listing.component';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { debounceTimeValue, platformMessages } from '../../../utils/constants';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserFormData } from './interfaces/user-form-data.interface';
import { UserAction, UserStatus } from '../../../shared/enums/user-management.enum';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ButtonConfig } from '../../../shared/interfaces/button-config.interface';

jest.mock('../../../services/admin/user-management/user-management.service');
jest.mock('../../../shared/service/snackbar/snackbar.service');

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userService: jest.Mocked<UserManagementService>;
  let snackbarService: jest.Mocked<SnackbarService>;

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

  const mockApiResponse: ApiResponse<PaginatedDataResponse<UserListData>> = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: mockUserResponse,
  };

  const mockExportBlob = new Blob(['test data'], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const mockMatSnackBar = {
    openFromComponent: jest.fn(),
  };

  const mockUserRow: UserFormData = {
    id: 1,
    fullName: 'John Doe',
    userName: 'johndoe',
    email: 'john@example.com',
    bio: 'Team lead',
    profilePic: 'https://example.com/john.jpg',
    password: '',
  };

  const mockUserByIdResponse: ApiResponse<UserFormData> = {
    result: true,
    statusCode: 200,
    message: 'User fetched successfully',
    data: mockUserRow,
  };

  const mockUsers: UserFormData[] = [
    {
      id: 1,
      fullName: 'John Doe',
      userName: 'johndoe',
      email: 'john@example.com',
      bio: 'Team Lead',
      profilePic: 'https://example.com/john.jpg',
      password: '',
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      userName: 'janesmith',
      email: 'jane@example.com',
      bio: 'Developer',
      profilePic: 'https://example.com/jane.jpg',
      password: '',
    },
  ];

  let dialogMock: { open: jest.Mock };

  beforeEach(async () => {
    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    };

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
        HttpClientTestingModule,
        MatSnackBarModule,
      ],
      providers: [
        {
          provide: UserManagementService,
          useValue: {
            getUsers: jest.fn().mockReturnValue(of(mockApiResponse)),
            exportUsersToExcel: jest.fn().mockReturnValue(of(mockExportBlob)),
            getUserById: jest.fn(),
            createOrUpdateUser: jest.fn(),
            updateUserStatusByAction: jest.fn(),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showError: jest.fn(),
            showSuccess: jest.fn(),
          },
        },
        {
          provide: MatSnackBar,
          useValue: mockMatSnackBar,
        },
        {
          provide: MatDialog,
          useValue: dialogMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserManagementService) as jest.Mocked<UserManagementService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    fixture.detectChanges();
  });
  const originalCreateElement = document.createElement;
  const originalURL = window.URL;

  afterEach(() => {
    jest.clearAllMocks();
    document.createElement = originalCreateElement;
    window.URL = originalURL;
  });

  it('should create the component', () => {
    // verifies component instantiation
    expect(component).toBeTruthy();
  });

  it('should call fetchUsers on init', () => {
    // checks API is called on component init
    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.dataSource().length).toBeGreaterThan(0);
    expect(component.totalItems()).toBe(1);
  });

  it('should debounce and fetch users on search input change', fakeAsync(() => {
    const spy = jest.spyOn(component as any, 'fetchUsers');
    component.onSearchInputChange('Jane');
    expect(spy).not.toHaveBeenCalled();
    tick(debounceTimeValue);
    expect(spy).toHaveBeenCalledTimes(1);
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

  it('should show snackbar error when API returns result: false', () => {
    // verifies snackbar error is shown when API returns unsuccessful result
    const failedApiResponse = {
      result: false,
      statusCode: 400,
      message: 'Bad Request',
      data: {
        totalRecords: 0,
        records: [],
      },
    };

    userService.getUsers.mockReturnValueOnce(of(failedApiResponse));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    component.fetchUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Bad Request', 'Error! 400');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should show snackbar error when API throws an error', () => {
    // verifies snackbar error is shown when API call fails with an error
    const mockError = {
      error: { message: 'Internal Server Error' },
      status: 500,
    };

    userService.getUsers.mockReturnValueOnce(throwError(() => mockError));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    component.fetchUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Internal Server Error', 'Error 500');
  });

  it('should handle unknown error structure and show fallback snackbar error', () => {
    // verifies snackbar error is shown for unexpected error structures
    userService.getUsers.mockReturnValueOnce(throwError(() => ({})));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    component.fetchUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Unexpected error occurred', 'Error Unknown');
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

    jest.spyOn(userService, 'getUserById').mockReturnValue(of(mockUserByIdResponse));

    const actionSpy = jest.spyOn(component, 'fetchUsers');

    userTable.triggerEventHandler('actionClick', { action: 'edit', row: { id: 1 } });
    expect(actionSpy).not.toHaveBeenCalled(); // replace if needed
  });

  it('should handle empty API response without errors', () => {
    // verifies UI handles empty API response gracefully
    userService.getUsers.mockReturnValueOnce(
      of({ ...mockApiResponse, data: { totalRecords: 0, records: [] } }),
    );
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

  it('should call UserExportService.exportUsers and trigger download', () => {
    jest.spyOn(userService, 'exportUsersToExcel').mockReturnValue(of(mockExportBlob));

    const anchorMock = {
      href: '',
      download: '',
      click: jest.fn(),
      setAttribute: jest.fn(),
      style: {},
      remove: jest.fn(),
    };

    const mockCreateElement = jest.fn().mockReturnValue(anchorMock);

    const mockCreateObjectURL = jest.fn(() => 'blob:http://mock-url');
    const mockRevokeObjectURL = jest.fn();

    Object.defineProperty(window, 'URL', {
      writable: true,
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
    });
    document.createElement = mockCreateElement as any;

    component.exportUsers();

    expect(userService.exportUsersToExcel).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockExportBlob);
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should show snackbar error when export returns an empty Blob', () => {
    const emptyBlob = new Blob([], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    userService.exportUsersToExcel.mockReturnValueOnce(of(emptyBlob));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    component.exportUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('No data available to export.');
  });

  it('should parse and show error message from Blob error', async () => {
    const mockErrorMessage = { message: 'Export failed due to server issue' };
    const mockBlob = new Blob([JSON.stringify(mockErrorMessage)], { type: 'application/json' });

    const mockError = {
      error: mockBlob,
      status: 500,
    };

    userService.exportUsersToExcel.mockReturnValueOnce(throwError(() => mockError));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    await component.exportUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Export failed.');
  });

  it('should show fallback export error when blob text parsing fails', async () => {
    const malformedBlob = new Blob(['not-json'], { type: 'application/json' });

    const mockError = {
      error: malformedBlob,
      status: 500,
    };

    userService.exportUsersToExcel.mockReturnValueOnce(throwError(() => mockError));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    await component.exportUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Export failed.');
  });

  it('should show export error for non-Blob errors', async () => {
    const mockError = {
      error: 'Server down',
      message: 'Server error',
      status: 500,
    };

    userService.exportUsersToExcel.mockReturnValueOnce(throwError(() => mockError));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    await component.exportUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Export failed.', 'Server error');
  });

  it('should show snackbar error when API returns statusCode not 200', () => {
    const failedApiResponse = {
      result: true,
      statusCode: 400,
      message: 'Custom error',
      data: {
        totalRecords: 0,
        records: [],
      },
    };

    userService.getUsers.mockReturnValueOnce(of(failedApiResponse));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    component.fetchUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Custom error', 'Error! 400');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should add filters to request when selectedRole and selectedStatus are set', () => {
    component.selectedRole = 2;
    component.selectedStatus = 1;
    const spy = jest.spyOn(userService, 'getUsers');
    component.fetchUsers();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          role: 2,
          status: 1,
        }),
      }),
    );
  });

  it('should show error when both result is false and statusCode is not 200', () => {
    const failedApiResponse = {
      result: false,
      statusCode: 400,
      message: 'Invalid input',
      data: {
        totalRecords: 0,
        records: [],
      },
    };

    userService.getUsers.mockReturnValueOnce(of(failedApiResponse));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    component.fetchUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Invalid input', 'Error! 400');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should show error using error.message if error.error is missing', () => {
    const mockError = {
      message: 'Network timeout',
      status: 408,
    };

    userService.getUsers.mockReturnValueOnce(throwError(() => mockError));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    component.fetchUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Network timeout', 'Error 408');
  });

  it('should use fallback message when export error has no message', async () => {
    const mockError = {
      error: 'Something went wrong',
      status: 500,
    };

    userService.exportUsersToExcel.mockReturnValueOnce(throwError(() => mockError));
    const snackbarSpy = jest.spyOn(snackbarService, 'showError');

    await component.exportUsers();

    expect(snackbarSpy).toHaveBeenCalledWith('Export failed.', 'Export failed.');
  });

  it('should call getUsers without filters if role and status are not selected', () => {
    component.selectedRole = undefined as any;
    component.selectedStatus = undefined as any;

    const spy = jest.spyOn(userService, 'getUsers');

    component.fetchUsers();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {},
      }),
    );
  });

  it('should open user dialog and set selected user', () => {
    component.openUserDialog(mockUserRow);
    expect(component.selectedUser()).toEqual(mockUserRow);
    expect(component.showUserDialog()).toBe(true);
  });

  it('should close user dialog and reset selected user', () => {
    component.closeUserDialog();
    expect(component.selectedUser()).toBeNull();
    expect(component.showUserDialog()).toBe(false);
  });

  it('should call handleUserSave with correct arguments when onSaveUser is triggered', () => {
    const formData = new FormData();
    const isEdit = true;
    const event = { formData, isEdit };

    const mockResponse = {
      statusCode: 200,
      message: 'User updated',
      result: true,
      data: null,
    };

    userService.createOrUpdateUser.mockReturnValue(of(mockResponse));
    const handleUserSaveSpy = jest.spyOn(component, 'handleUserSave');

    component.onSaveUser(event);

    expect(handleUserSaveSpy).toHaveBeenCalledWith(formData, isEdit);
  });

  it('should handle user creation success', () => {
    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 201,
      message: 'User created successfully',
      data: null,
    };

    userService.createOrUpdateUser.mockReturnValue(of(mockResponse));
    const spyFetch = jest.spyOn(component, 'fetchUsers').mockImplementation();
    const spyClose = jest.spyOn(component, 'closeUserDialog');

    component.handleUserSave(new FormData(), false);

    expect(snackbarService.showSuccess).toHaveBeenCalledWith(
      'User created successfully',
      'Success',
    );
    expect(spyFetch).toHaveBeenCalled();
    expect(spyClose).toHaveBeenCalled();
  });

  it('should handle user update success', () => {
    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 200,
      message: 'User updated successfully',
      data: null,
    };

    userService.createOrUpdateUser.mockReturnValue(of(mockResponse));
    const spyFetch = jest.spyOn(component, 'fetchUsers').mockImplementation();
    const spyClose = jest.spyOn(component, 'closeUserDialog');

    component.handleUserSave(new FormData(), true);

    expect(snackbarService.showSuccess).toHaveBeenCalledWith(
      'User updated successfully',
      'Success',
    );
    expect(spyFetch).toHaveBeenCalled();
    expect(spyClose).toHaveBeenCalled();
  });

  it('should handle user creation failure (201 not returned)', () => {
    const mockResponse: ApiResponse<null> = {
      result: false,
      statusCode: 400,
      message: 'Bad request',
      data: null,
    };

    userService.createOrUpdateUser.mockReturnValue(of(mockResponse));
    const spyFetch = jest.spyOn(component, 'fetchUsers').mockImplementation();
    const spyClose = jest.spyOn(component, 'closeUserDialog');

    component.handleUserSave(new FormData(), false);

    expect(snackbarService.showError).toHaveBeenCalledWith('Bad request', 'Error 400');
    expect(spyFetch).not.toHaveBeenCalled();
    expect(spyClose).not.toHaveBeenCalled();
  });

  it('should handle user creation error', () => {
    const errorResponse = {
      error: { message: 'Internal server error' },
    };

    userService.createOrUpdateUser.mockReturnValue(throwError(() => errorResponse));
    const spyFetch = jest.spyOn(component, 'fetchUsers').mockImplementation();
    const spyClose = jest.spyOn(component, 'closeUserDialog');

    component.handleUserSave(new FormData(), false);

    expect(snackbarService.showError).toHaveBeenCalledWith('Internal server error', 'Error');
    expect(spyFetch).not.toHaveBeenCalled();
    expect(spyClose).not.toHaveBeenCalled();
  });

  it('should load user for edit', () => {
    const userId = 1;
    const spyLoadUser = jest.spyOn(component, 'loadUserForEdit').mockImplementation();

    component.handleUserAction({ action: 'edit', row: { id: userId } });

    expect(spyLoadUser).toHaveBeenCalledWith(userId);
  });

  it('should open delete confirmation dialog', () => {
    const userId = 1;
    const spyConfirmDialog = jest.spyOn(component, 'openConfirmationDialog');

    component.handleUserAction({ action: 'delete', row: { id: userId } });

    expect(spyConfirmDialog).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
  });

  it('should open suspend confirmation dialog', () => {
    const userId = 1;
    const spyConfirmDialog = jest.spyOn(component, 'openConfirmationDialog');

    component.handleUserAction({ action: 'block', row: { id: userId } });

    expect(spyConfirmDialog).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
  });

  it('should open activate confirmation dialog', () => {
    const userId = 1;
    const spyConfirmDialog = jest.spyOn(component, 'openConfirmationDialog');

    component.handleUserAction({ action: 'check_circle_outline', row: { id: userId } });

    expect(spyConfirmDialog).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
  });

  it('should open inactivate confirmation dialog', () => {
    const userId = 1;
    const spyConfirmDialog = jest.spyOn(component, 'openConfirmationDialog');

    component.handleUserAction({ action: 'remove_circle_outline', row: { id: userId } });

    expect(spyConfirmDialog).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
  });

  it('should load user data and open dialog on success', () => {
    const userId = 1;

    const user: UserFormData = {
      id: userId,
      fullName: 'Test User',
      userName: 'testuser',
      email: 'test@example.com',
      password: 'securepass123',
      bio: 'Test bio',
      profilePic: '',
    };

    const mockResponse: ApiResponse<typeof user> = {
      result: true,
      statusCode: 200,
      message: 'User fetched successfully',
      data: user,
    };

    const spyGetUser = jest.spyOn(userService, 'getUserById').mockReturnValue(of(mockResponse));
    const spyOpenDialog = jest.spyOn(component, 'openUserDialog');

    component.loadUserForEdit(userId);

    expect(spyGetUser).toHaveBeenCalledWith(userId);
    expect(spyOpenDialog).toHaveBeenCalledWith(user);
  });

  it('should show error if user fetch fails (non-200)', () => {
    const userId = 1;

    const mockErrorResponse: ApiResponse<UserFormData> = {
      result: false,
      statusCode: 404,
      message: 'User not found',
      data: null as unknown as UserFormData,
    };

    const spyGetUser = jest
      .spyOn(userService, 'getUserById')
      .mockReturnValue(of(mockErrorResponse));
    const spyOpenDialog = jest.spyOn(component, 'openUserDialog');

    component.loadUserForEdit(userId);

    expect(spyGetUser).toHaveBeenCalledWith(userId);
    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'User not found',
    );
    expect(spyOpenDialog).not.toHaveBeenCalled(); // dialog should not open
  });

  it('should show error if user fetch throws error', () => {
    const userId = 1;
    const errorMessage = 'Fetch failed';

    const errorResponse = {
      error: {
        message: errorMessage,
      },
    };

    const spyGetUser = jest
      .spyOn(userService, 'getUserById')
      .mockReturnValue(throwError(() => errorResponse));

    const spySnackbar = jest.spyOn(snackbarService, 'showError');
    const spyOpenDialog = jest.spyOn(component, 'openUserDialog');

    component.loadUserForEdit(userId);

    expect(spyGetUser).toHaveBeenCalledWith(userId);
    expect(spySnackbar).toHaveBeenCalledWith(platformMessages.errorTitle, errorMessage);
    expect(spyOpenDialog).not.toHaveBeenCalled();
  });

  it('should call onConfirm when dialog result is true', () => {
    const mockDialogRef = {
      afterClosed: () => of(true),
    };
    const onConfirm = jest.fn();

    const dialogData: ConfirmationDialogData = {
      title: 'Confirm Delete',
      message: 'Are you sure?',
      confirmButtonConfig: { text: 'Confirm' } as ButtonConfig,
      cancelButtonConfig: { text: 'Cancel' } as ButtonConfig,
    };

    dialogMock.open.mockReturnValue(mockDialogRef as any);

    component.openConfirmationDialog(dialogData, onConfirm);

    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: dialogData,
        disableClose: true,
        width: '600px',
        panelClass: 'custom-dialog-radius',
      }),
    );

    expect(onConfirm).toHaveBeenCalled();
  });

  it('should not call onConfirm when dialog result is false', () => {
    const mockDialogRef = {
      afterClosed: () => of(false),
    };
    const onConfirm = jest.fn();

    const dialogData: ConfirmationDialogData = {
      title: 'Confirm Action',
      message: 'Do you want to proceed?',
      confirmButtonConfig: { text: 'Confirm' } as ButtonConfig,
      cancelButtonConfig: { text: 'Cancel' } as ButtonConfig,
    };

    dialogMock.open.mockReturnValue(mockDialogRef as any);

    component.openConfirmationDialog(dialogData, onConfirm);

    expect(dialogMock.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: dialogData,
        width: '600px',
        disableClose: true,
        panelClass: 'custom-dialog-radius',
      }),
    );

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should show success and fetch users on status update success', () => {
    const userId = 1;
    const action: UserAction = UserAction.Delete;
    const expectedSuccessMessage = 'User deleted successfully';

    userService.updateUserStatusByAction.mockReturnValue(
      of({
        statusCode: 200,
        message: expectedSuccessMessage,
        result: true,
        data: null,
      }),
    );

    const fetchSpy = jest.spyOn(component, 'fetchUsers');

    component.updateUserStatus(userId, action);

    expect(userService.updateUserStatusByAction).toHaveBeenCalledWith({
      id: userId,
      action,
      newStatus: undefined,
    });
    expect(snackbarService.showSuccess).toHaveBeenCalledWith(
      platformMessages.successTitle,
      expectedSuccessMessage,
    );
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should show error if status update fails (non-200)', () => {
    const userId = 1;
    const action: UserAction = UserAction.UpdateStatus;
    const newStatus: UserStatus = UserStatus.Suspended;
    const errorMessage = 'Bad Request';

    userService.updateUserStatusByAction.mockReturnValue(
      of({
        statusCode: 400,
        message: errorMessage,
        result: false,
        data: null,
      }),
    );

    const serviceSpy = jest.spyOn(userService, 'updateUserStatusByAction');

    component.updateUserStatus(userId, action, newStatus);

    expect(serviceSpy).toHaveBeenCalledWith({
      id: userId,
      action,
      newStatus,
    });

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      errorMessage,
    );
  });

  it('should show error if update fails due to server error', () => {
    const userId = 1;
    const action: UserAction = UserAction.UpdateStatus;
    const newStatus: UserStatus = UserStatus.Inactive;
    const serverErrorMessage = 'Server Down';

    userService.updateUserStatusByAction.mockReturnValue(
      throwError(() => ({
        error: { message: serverErrorMessage },
      })),
    );

    const serviceSpy = jest.spyOn(userService, 'updateUserStatusByAction');

    component.updateUserStatus(userId, action, newStatus);

    expect(serviceSpy).toHaveBeenCalledWith({
      id: userId,
      action,
      newStatus,
    });

    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      serverErrorMessage,
    );
  });

  it('should return delete message when action is Delete', () => {
    const result = component.getActionMessage(UserAction.Delete);
    expect(result).toBe('User deleted successfully');
  });

  it('should return activation message when status is Active', () => {
    const result = component.getActionMessage(UserAction.UpdateStatus, UserStatus.Active);
    expect(result).toBe('User activated successfully');
  });

  it('should return suspension message when status is Suspended', () => {
    const result = component.getActionMessage(UserAction.UpdateStatus, UserStatus.Suspended);
    expect(result).toBe('User suspended successfully');
  });

  it('should return inactivation message when status is Inactive', () => {
    const result = component.getActionMessage(UserAction.UpdateStatus, UserStatus.Inactive);
    expect(result).toBe('User inactivated successfully');
  });

  it('should return generic message when status is undefined or unrecognized', () => {
    const result1 = component.getActionMessage(UserAction.UpdateStatus);
    expect(result1).toBe('User status updated');

    const result2 = component.getActionMessage(UserAction.UpdateStatus, 'unknownStatus' as any);
    expect(result2).toBe('User status updated');
  });
});
