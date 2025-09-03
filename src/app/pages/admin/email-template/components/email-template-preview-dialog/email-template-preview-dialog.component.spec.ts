import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailTemplatePreviewDialogComponent } from './email-template-preview-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtml } from '@angular/platform-browser';

// Mock MatDialogRef
const matDialogRefMock = {
  close: jest.fn(),
};

describe('EmailTemplatePreviewDialogComponent', () => {
  let component: EmailTemplatePreviewDialogComponent;
  let fixture: ComponentFixture<EmailTemplatePreviewDialogComponent>;
  let sanitizer: DomSanitizer;

  const mockTemplateData = {
    body: '<p>Hello World</p>',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplatePreviewDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockTemplateData },
        { provide: MatDialogRef, useValue: matDialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplatePreviewDialogComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should sanitize and set safeBody on ngOnInit', () => {
    const spySanitize = jest.spyOn(sanitizer, 'bypassSecurityTrustHtml');
    component.ngOnInit();

    expect(spySanitize).toHaveBeenCalledWith(mockTemplateData.body);
    expect(component.safeBody()).toBeTruthy(); // safe value set
  });

  it('should handle null body and set safeBody to empty string', () => {
    const spySanitize = jest.spyOn(sanitizer, 'bypassSecurityTrustHtml');

    // Override component data to have null body
    (component as any).templateData = { body: null };
    component.ngOnInit();

    expect(spySanitize).toHaveBeenCalledWith('');
    expect(component.safeBody()).toBeTruthy(); // safe value set
  });

  it('should call dialogRef.close when closeDialog is called', () => {
    component.closeDialog();
    expect(matDialogRefMock.close).toHaveBeenCalled();
  });
});
