import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FilledButtonComponent } from '../../../../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../../../../shared/components/outline-button/outline-button.component';
import { TemplatePortal } from '@angular/cdk/portal';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import {
  cancelButtonConfig,
  challengeFriendFormField,
  sendChallengeButtonConfig,
} from '../../configs/challenge-friend.config';
import { DynamicFormField } from '../../../../../../shared/interfaces/dynamic-form-field.interface';
import { UserBattlesService } from '../../../../../../services/user/user-battles/user-battles.service';
import { BattleUserSearchResult, DialogData } from '../../interfaces/challenge-friend.interface';
import { environment } from '../../../../../../../environments/environment.dev';
import { TagInputConfig } from '../../../../../../shared/interfaces/tag-component.interface';
import { TagComponent } from '../../../../../../shared/components/tag/tag.component';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { platformMessages } from '../../../../../../utils/constants';
import { SnackbarService } from '../../../../../../shared/service/snackbar/snackbar.service';
import { ApiResponse } from '../../../../../../shared/interfaces/api-response.interface';

@Component({
  selector: 'app-challenge-friend',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FilledButtonComponent,
    OutlineButtonComponent,
    TagComponent,
  ],
  templateUrl: './challenge-friend.component.html',
  styleUrl: './challenge-friend.component.scss',
})
export class ChallengeFriendComponent {
  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<unknown>;
  @ViewChild('usernameInput', { static: false }) usernameInput!: ElementRef<HTMLInputElement>;

  challengeFriendForm: FormGroup;
  challengeFriendFormField: DynamicFormField = challengeFriendFormField;
  battleName: string;

  filteredUsers: BattleUserSearchResult[] = [];
  selectedUser: BattleUserSearchResult | null = null;
  highlightedIndex = -1;
  searchQuery = '';

  cancelButton = cancelButtonConfig;
  sendChallengeButton = sendChallengeButtonConfig;

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ChallengeFriendComponent>);
  private readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();
  private readonly userBattlesService = inject(UserBattlesService);
  private readonly snackbarService = inject(SnackbarService);

  private overlayRef: OverlayRef | null = null;

  constructor() {
    this.battleName = this.data.battleName;
    this.challengeFriendForm = this.fb.group({
      friendusername: [''],
    });
  }

  ngOnInit(): void {
    this.initializeUserSearchListener();
  }

  initializeUserSearchListener(): void {
    this.challengeFriendForm
      .get(this.challengeFriendFormField.name)
      ?.valueChanges.pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => this.handleSearch(value)),
        takeUntil(this.destroy$),
      )
      .subscribe((response) => this.handleSearchResponse(response));
  }

  handleSearch(value: string) {
    const trimmed = value.trim();
    this.searchQuery = trimmed;

    if (!trimmed) {
      this.filteredUsers = [];
      this.closeDropdown();
      this.selectedUser = null;
      return of(null);
    }

    return this.userBattlesService.searchUsers(trimmed, this.data.battleId).pipe(
      catchError(() => {
        this.filteredUsers = [];
        return of(null);
      }),
    );
  }

  handleSearchResponse(response: ApiResponse<BattleUserSearchResult[]> | null): void {
    if (!response) {
      if (this.searchQuery) {
        this.openDropdown(this.usernameInput.nativeElement);
      }
      return;
    }

    if (response.result && response.data) {
      const raw = response.data ?? [];
      this.filteredUsers = raw.map((u) => ({
        ...u,
        profilePic: u.profilePic ? `${environment.imageBaseUrl}/${u.profilePic}` : '',
      }));

      if (this.filteredUsers.length > 0 && this.usernameInput) {
        this.openDropdown(this.usernameInput.nativeElement);
      } else {
        this.closeDropdown();
      }
    } else {
      this.filteredUsers = [];
      this.closeDropdown();
    }
    this.highlightedIndex = -1;
  }

  openDropdown(origin: HTMLElement) {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }

    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 8,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -8,
        },
      ])
      .withFlexibleDimensions(false)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      minWidth: origin.clientWidth,
      maxWidth: '95vw',
    });

    this.overlayRef.attach(new TemplatePortal(this.dropdownTemplate, this.vcr));

    this.overlayRef.backdropClick().subscribe(() => this.closeDropdown());
  }

  closeDropdown() {
    this.overlayRef?.detach();
    this.overlayRef = null;
  }

  selectUser(user: BattleUserSearchResult): void {
    this.selectedUser = user;

    const control = this.challengeFriendForm.get(this.challengeFriendFormField.name);
    control?.setValue(user.userName, { emitEvent: false });

    this.closeDropdown();
    this.highlightedIndex = -1;
  }

  getXPTagConfig(xp: number): TagInputConfig {
    return {
      id: 'xp',
      label: `${xp.toLocaleString()} XP`,
      type: 'static',
      backgroundColor: 'black',
      textColor: 'white',
      hasBorder: false,
      isSelected: false,
    };
  }

  getRequestTagConfig(): TagInputConfig {
    return {
      id: 'request',
      label: 'Requested',
      type: 'static',
      backgroundColor: 'lightGreen',
      textColor: 'green',
      hasBorder: false,
      isSelected: false,
    };
  }

  onSubmit(): void {
    if (this.challengeFriendForm.valid && this.selectedUser) {
      const username = this.selectedUser.userName;

      this.userBattlesService
        .sendBattleRequest(username, this.data.battleId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (!res.result || res.statusCode !== 200) {
              this.snackbarService.showError(
                platformMessages.errorTitle,
                res.message || platformMessages.errorMessage,
              );
              return;
            }

            this.dialogRef.close(res.message);
            this.snackbarService.showSuccess('Success', res.message);
          },
          error: (err) => {
            this.snackbarService.showError(
              platformMessages.errorTitle,
              err?.error?.message || platformMessages.errorMessage,
            );
          },
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
    }
  }

  getInitialsColorClass(name: string): string {
    if (!name) return 'bg-avatar-0';
    const colorsCount = 12;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorsCount;
    return `bg-avatar-${index}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
