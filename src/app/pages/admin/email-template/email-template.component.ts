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
import { tablePaginationConfig, platformMessages } from '../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';

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
  private readonly emailService = inject(EmailTemplateService);
  private readonly snackbar = inject(SnackbarService);

  createTemplateButtonConfig = createTemplateButtonConfig;
  emailHeaderConfig = emailHeaderConfig;
  columnsConfig = emailTableColumnsConfig;

  dataSource: WritableSignal<TableData[]> = signal([]);
  totalItems = signal<number>(0);
  sort = signal({ sortColumn: 'id', sortDescending: false });

  private readonly destroy$ = new Subject<void>();

  //#region Lifecycle
  ngOnInit(): void {
    this.loadEmailTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

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
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle} ${err.status}`, message);
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

  //#region Create Email Dialog
  openEmailTemplateDialgue() {}
  //#endregion
}
