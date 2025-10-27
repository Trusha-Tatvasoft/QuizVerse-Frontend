import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailTemplatesResponseDto } from '../../configs/email-template.component.config';

@Component({
  selector: 'app-email-template-preview-dialog',
  imports: [MatDialogModule, MatIconModule, CommonModule],
  templateUrl: './email-template-preview-dialog.component.html',
  styleUrl: './email-template-preview-dialog.component.scss',
})
export class EmailTemplatePreviewDialogComponent {
  templateData = inject<EmailTemplatesResponseDto>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EmailTemplatePreviewDialogComponent>);
  private readonly sanitizer = inject(DomSanitizer);

  safeBody = signal<SafeHtml>('');

  ngOnInit() {
    this.safeBody.set(this.sanitizer.bypassSecurityTrustHtml(this.templateData.body ?? ''));
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
