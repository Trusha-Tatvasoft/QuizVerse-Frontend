import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { ChallengeFriendComponent } from './challenge-friend.component';
import { BattleUserSearchResult, DialogData } from '../../interfaces/challenge-friend.interface';
import { Observable, of, Subject } from 'rxjs';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserBattlesService } from '../../../../../../services/user/user-battles/user-battles.service';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { FormBuilder } from '@angular/forms';
import { environment } from '../../../../../../../environments/environment.dev';

const mockDialogData: DialogData = { battleName: 'Test Battle', battleId: 42 };

const mockUserBattlesService = {
  searchUsers: jest.fn((term: string, battleId: number) =>
    of<{ result: boolean; data: BattleUserSearchResult[] }>({
      result: true,
      data: [],
    }),
  ),
  sendBattleRequest: jest.fn((username: string, battleId: number) =>
    of({ result: true, statusCode: 200, message: 'sent' }),
  ),
};

const mockSnackbarService = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
};

const mockMatDialogRef = { close: jest.fn() };

const mockOverlayRef: Partial<OverlayRef> = {
  detach: jest.fn(),
  attach: jest.fn(),
  backdropClick: jest.fn(() => of(new MouseEvent('click'))),
};

const mockOverlay = {
  create: jest.fn(() => mockOverlayRef as OverlayRef),
  scrollStrategies: { reposition: jest.fn() },
  position: () =>
    ({
      flexibleConnectedTo: () => ({
        withPositions: () => ({
          withFlexibleDimensions: () => ({
            withPush: () => mockPositionStrategy,
          }),
        }),
      }),
    }) as any,
};

const mockPositionStrategy: Partial<PositionStrategy> = {};

describe('ChallengeFriendComponent', () => {
  let component: ChallengeFriendComponent;
  let fixture: ComponentFixture<ChallengeFriendComponent>;
  let injectedOverlay: Overlay;
  let createSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeFriendComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: UserBattlesService, useValue: mockUserBattlesService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: Overlay, useValue: mockOverlay },
        { provide: FormBuilder, useValue: new FormBuilder() },
      ],
    }).compileComponents();

    injectedOverlay = TestBed.inject(Overlay);

    createSpy = jest.spyOn(injectedOverlay, 'create');

    fixture = TestBed.createComponent(ChallengeFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call searchUsers when a value is typed and debounce runs', fakeAsync(() => {
    const searchSpy = jest.spyOn(mockUserBattlesService, 'searchUsers');
    const formControl = component.challengeFriendForm.get(component.challengeFriendFormField.name);

    formControl?.setValue('John', { emitEvent: true });

    tick(600);

    expect(searchSpy).toHaveBeenCalledWith('John', mockDialogData.battleId);
    flush();
  }));

  it('should not call searchUsers twice for the same value (distinctUntilChanged)', fakeAsync(() => {
    const searchSpy = jest.spyOn(mockUserBattlesService, 'searchUsers');
    const formControl = component.challengeFriendForm.get(component.challengeFriendFormField.name);

    formControl?.setValue('John', { emitEvent: true });
    tick(600);
    formControl?.setValue('John', { emitEvent: true });
    tick(600);

    expect(searchSpy).toHaveBeenCalledTimes(1);
    flush();
  }));

  it('should handle searchUsers error and set filteredUsers to []', fakeAsync(() => {
    mockUserBattlesService.searchUsers.mockReturnValueOnce(
      new Observable(() => {
        throw new Error('Network error');
      }),
    );

    const formControl = component.challengeFriendForm.get(component.challengeFriendFormField.name);

    component.filteredUsers = [
      {
        userName: 'Old User',
        profilePic: '',
        fullName: 'Old User',
        totalXp: 10,
        hasRequest: false,
      },
    ];

    formControl?.setValue('ErrorTest', { emitEvent: true });
    tick(600);

    expect(component.filteredUsers).toEqual([]);
  }));

  it('should clear filteredUsers and close dropdown when response.result is false', fakeAsync(() => {
    mockUserBattlesService.searchUsers.mockReturnValueOnce(of({ result: false, data: [] }));

    const formControl = component.challengeFriendForm.get(component.challengeFriendFormField.name);

    const closeSpy = jest.spyOn(component as any, 'closeDropdown');

    component.filteredUsers = [
      {
        userName: 'Temp',
        fullName: 'Temp User',
        profilePic: '',
        totalXp: 0,
        hasRequest: false,
      },
    ];

    formControl?.setValue('Test', { emitEvent: true });
    tick(600);

    expect(component.filteredUsers).toEqual([]);
    expect(closeSpy).toHaveBeenCalled();
  }));

  it('should clear dropdown and filteredUsers when input is empty', fakeAsync(() => {
    const formControl = component.challengeFriendForm.get(component.challengeFriendFormField.name);

    component.filteredUsers = [
      {
        userName: 'Bob',
        profilePic: '',
        fullName: 'Bob Patel',
        totalXp: 10,
        hasRequest: false,
      },
    ];

    const anyComp = component as any;
    anyComp.openDropdown(component.usernameInput.nativeElement);

    expect(anyComp.overlayRef).toBeTruthy();

    formControl?.setValue('', { emitEvent: true });
    tick(600);

    expect(component.filteredUsers).toEqual([]);
    expect(anyComp.overlayRef).toBeNull();
  }));

  it('should open dropdown when users are found', fakeAsync(() => {
    const mockUser = {
      userName: 'Alice',
      profilePic: 'pic.png',
      xp: 20,
      fullName: 'Alice Smith',
      totalXp: 20,
      hasRequest: false,
    };

    mockUserBattlesService.searchUsers.mockReturnValueOnce(of({ result: true, data: [mockUser] }));

    const formControl = component.challengeFriendForm.get(component.challengeFriendFormField.name);

    formControl?.setValue('Ali', { emitEvent: true });
    tick(600);

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].userName).toBe('Alice');
    expect(component.filteredUsers[0].profilePic).toBe(`${environment.imageBaseUrl}/pic.png`);
    expect(component.filteredUsers[0].fullName).toBe('Alice Smith');

    const anyComp = component as any;
    expect(anyComp.overlayRef).toBeTruthy();
  }));

  it('should select a user, set form value, close dropdown, and reset index', () => {
    const mockUser: BattleUserSearchResult = {
      userName: 'Bob',
      fullName: 'Bob Demo',
      profilePic: '',
      totalXp: 10,
      hasRequest: false,
    };

    const closeSpy = jest.spyOn(component as any, 'closeDropdown');

    (component as any).overlayRef = mockOverlayRef as OverlayRef;

    component.selectUser(mockUser);

    expect(component.selectedUser).toEqual(mockUser);

    const control = component.challengeFriendForm.get(component.challengeFriendFormField.name);
    expect(control?.value).toBe('Bob');
    expect(closeSpy).toHaveBeenCalled();
    expect(component.highlightedIndex).toBe(-1);
  });

  it('should submit and close dialog + show success on valid form and selected user', fakeAsync(() => {
    const mockUser: BattleUserSearchResult = {
      userName: 'Bob',
      fullName: 'Bob Demo',
      profilePic: '',
      totalXp: 10,
      hasRequest: false,
    };

    component.selectedUser = mockUser;
    const ctrl = component.challengeFriendForm.get(component.challengeFriendFormField.name);
    ctrl?.setValue('Bob');

    component.onSubmit();
    tick();

    expect(mockUserBattlesService.sendBattleRequest).toHaveBeenCalledWith(
      'Bob',
      mockDialogData.battleId,
    );

    expect(mockMatDialogRef.close).toHaveBeenCalledWith('sent');
    expect(mockSnackbarService.showSuccess).toHaveBeenCalledWith('Success', 'sent');

    flush();
  }));

  it('should show error if sendBattleRequest returns result=false or non-200 code', fakeAsync(() => {
    mockUserBattlesService.sendBattleRequest.mockReturnValueOnce(
      of({ result: false, statusCode: 400, message: 'failed' }),
    );

    const mockUser = {
      userName: 'Bob',
      fullName: 'Bob Demo',
      profilePic: '',
      totalXp: 10,
      hasRequest: false,
    };

    component.selectedUser = mockUser;
    const ctrl = component.challengeFriendForm.get(component.challengeFriendFormField.name);
    ctrl?.setValue('Bob');

    component.onSubmit();
    tick();

    expect(mockSnackbarService.showError).toHaveBeenCalledWith(expect.any(String), 'failed');
    expect(mockMatDialogRef.close).not.toHaveBeenCalled();

    flush();
  }));

  it('should do nothing if form is invalid or no selectedUser', () => {
    const spyReq = jest.spyOn(mockUserBattlesService, 'sendBattleRequest');
    component.onSubmit();
    expect(spyReq).not.toHaveBeenCalled();
  });

  it('should close the dialog on cancel', () => {
    component.onCancel();
    expect(mockMatDialogRef.close).toHaveBeenCalled();
  });

  it('should return initials correctly', () => {
    expect(component.getInitials('')).toBe('');
    expect(component.getInitials('Alice')).toBe('A');
    expect(component.getInitials('Alice Brown')).toBe('AB');
  });

  it('should return a bg-avatar class based on name hash', () => {
    const colorClass = component.getInitialsColorClass('Alice');
    expect(colorClass).toMatch(/^bg-avatar-\d+$/);
  });

  it('should return bg-avatar-0 if name is empty', () => {
    expect(component.getInitialsColorClass('')).toBe('bg-avatar-0');
  });

  it('should detach overlayRef and set to null', () => {
    (component as any).overlayRef = mockOverlayRef as OverlayRef;

    const anyComp = component as any;
    anyComp.closeDropdown();

    expect(mockOverlayRef.detach).toHaveBeenCalled();
    expect(anyComp.overlayRef).toBeNull();
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const destroySpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should return correct TagInputConfig for XP', () => {
    const cfg = component.getXPTagConfig(1500);
    expect(cfg.label).toBe('1,500 XP');
    expect(cfg.id).toBe('xp');
  });

  it('should return correct TagInputConfig for request', () => {
    const cfg = component.getRequestTagConfig();
    expect(cfg.label).toBe('Requested');
    expect(cfg.id).toBe('request');
  });
});
