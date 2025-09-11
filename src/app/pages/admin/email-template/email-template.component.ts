import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableData } from '../../../shared/interfaces/table-component.interface';
import { EmailTemplateService } from '../../../services/admin/email-templates/email-template.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import {
  createTemplateButtonConfig,
  emailHeaderConfig,
  emailTableColumnsConfig,
} from './configs/email-template.component.config';
import { emailTemplateToTableData } from './email-template.component.mapper';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import {
  tablePaginationConfig,
  platformMessages,
  emailActions,
  emailTemplateActionMessages,
} from '../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { EmailTemplateFormComponent } from './components/email-template-form/email-template-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogData } from '../../../shared/interfaces/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  activateEmailTemplateDialog,
  deleteEmailTemplateDialog,
  inactivateEmailTemplateDialog,
} from './configs/email-template-form.config';
import {
  EmailTemplateAction,
  EmailTemplateStatus,
} from '../../../shared/enums/email-template.enum';
import { EmailTemplatePreviewDialogComponent } from './components/email-template-preview-dialog/email-template-preview-dialog.component';

@Component({
  selector: 'app-email-template',
  imports: [FilledButtonComponent, PageHeaderComponent, TableComponent],
  templateUrl: './email-template.component.html',
  styleUrls: [
    './email-template.component.scss',
    '../quiz-difficulty-level/quiz-difficulty-level.component.scss',
  ],
})
export class EmailTemplateComponent {
  createTemplateButtonConfig = createTemplateButtonConfig;
  emailHeaderConfig = emailHeaderConfig;
  columnsConfig = emailTableColumnsConfig;

  dataSource: WritableSignal<TableData[]> = signal([]);
  totalItems = signal<number>(0);
  sort = signal({ sortColumn: 'id', sortDescending: false });

  private readonly emailService = inject(EmailTemplateService);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadEmailTemplates();
  }

  //#region API Call EmailList
  loadEmailTemplates(): void {
    const request: PaginationRequest = {
      pageNumber: 1,
      pageSize: tablePaginationConfig.PageSize,
      sortColumn: this.sort().sortColumn,
      sortDescending: this.sort().sortDescending,
    };

    this.emailService
      .getAllEmailTemplates(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.result || res.statusCode !== 200) {
            this.snackbar.showError(
              `${platformMessages.errorTitle} ${res.statusCode}`,
              res.message || platformMessages.errorMessage,
            );
            this.dataSource.set([]);
            this.totalItems.set(0);
            return;
          }

          this.dataSource.set(res.data.records.map(emailTemplateToTableData));
          this.totalItems.set(res.data.totalRecords);
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
          this.dataSource.set([]);
          this.totalItems.set(0);
        },
      });
  }
  //#endregion

  //#region Sorting
  onSortChange(event: { active: string; direction: string }) {
    this.sort.set({
      sortColumn: event.active,
      sortDescending: event.direction === 'desc',
    });
    this.loadEmailTemplates();
  }
  //#endregion

  handleEmailAction(event: { action: string; row: TableData }): void {
    const emailTemplate = event.row;
    switch (event.action) {
      case emailActions.DELETE:
        this.openConfirmationDialog(deleteEmailTemplateDialog, () =>
          this.updateEmailTemplateStatus(emailTemplate['id'] as number, EmailTemplateAction.Delete),
        );
        break;

      case emailActions.EDIT:
        this.openEmailTemplateDialgue('edit', emailTemplate['id'] as number);
        break;

      case emailActions.ACTIVATE:
      case emailActions.INACTIVATE:
        this.openConfirmationDialog(
          event.action === emailActions.ACTIVATE
            ? activateEmailTemplateDialog
            : inactivateEmailTemplateDialog,
          () =>
            this.updateEmailTemplateStatus(
              emailTemplate['id'] as number,
              EmailTemplateAction.UpdateStatus,
              event.action === emailActions.ACTIVATE
                ? EmailTemplateStatus.Active
                : EmailTemplateStatus.Inactive,
            ),
        );
        break;

      case emailActions.PREVIEW:
        this.openPreviewDialog(emailTemplate['id'] as number);
        break;
    }
  }

  //#region Create Email Dialog
  openEmailTemplateDialgue(mode: 'create' | 'edit' = 'create', template?: number) {
    const dialogRef = this.dialog.open(EmailTemplateFormComponent, {
      minWidth: '50vw',
      maxWidth: '100vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {
        mode,
        id: template,
      },
    });

    dialogRef.afterClosed().subscribe((changed) => {
      if (changed) {
        this.loadEmailTemplates();
      }
    });
  }
  //#endregion

  openConfirmationDialog(dialogData: ConfirmationDialogData, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      disableClose: true,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) onConfirm();
    });
  }

  //#region Update Email Status
  updateEmailTemplateStatus(
    templateId: number,
    action: EmailTemplateAction,
    status?: EmailTemplateStatus,
  ): void {
    this.emailService
      .updateEmailTemplateByAction({ id: templateId, action })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.snackbar.showSuccess(
              platformMessages.successTitle,
              this.getEmailTemplateActionMessage(action, status),
            );
            this.loadEmailTemplates();
          } else {
            this.snackbar.showError(
              platformMessages.errorTitle,
              res.message || platformMessages.errorMessage,
            );
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }
  //#endregion

  //#region Preview Dialog
  openPreviewDialog(templateId: number): void {
    this.emailService
      .getEmailTemplateById(templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result && res.statusCode === 200) {
            this.dialog.open(EmailTemplatePreviewDialogComponent, {
              minWidth: '45vw',
              maxWidth: '100vw',
              maxHeight: '95vh',
              data: res.data,
            });
          } else {
            this.snackbar.showError('Error', res.message || 'Failed to fetch template');
          }
        },
        error: (err) => {
          this.snackbar.showError(
            platformMessages.errorTitle,
            err?.error?.message || platformMessages.errorMessage,
          );
        },
      });
  }
  //#endregion

  //#region Helper Methods
  getEmailTemplateActionMessage(action: EmailTemplateAction, status?: EmailTemplateStatus): string {
    if (action === EmailTemplateAction.Delete) {
      return emailTemplateActionMessages.deleted;
    }

    switch (status) {
      case EmailTemplateStatus.Active:
        return emailTemplateActionMessages.activated;
      case EmailTemplateStatus.Inactive:
        return emailTemplateActionMessages.inactivated;
      default:
        return emailTemplateActionMessages.statusUpdated;
    }
  }
  //#endregion

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
