import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { OutlineButtonComponent } from '../outline-button/outline-button.component';
import { FilledButtonComponent } from '../filled-button/filled-button.component';
import { mockDataDialog } from './confirmation-dialog-mock-data';

describe('ConfirmationDialogComponent (Jest)', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let dialogRefMock: { close: jest.Mock };

  // Mock input data used to simulate different dialog states
  const mockData = mockDataDialog;

  beforeEach(async () => {
    // Mock MatDialogRef with jest function to observe close calls
    dialogRefMock = {
      close: jest.fn(),
    };

    // Set up testing module with all necessary imports and providers
    await TestBed.configureTestingModule({
      imports: [
        ConfirmationDialogComponent,
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        OutlineButtonComponent,
        FilledButtonComponent,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    // Create and initialize component
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Basic check to ensure component is created without error
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Verify that title, message, and buttons are rendered correctly
  it('should render title, message, and buttons correctly', () => {
    const titleEl = fixture.nativeElement.querySelector('h2');
    const msgEl = fixture.nativeElement.querySelector('.message-text');
    const buttons = fixture.nativeElement.querySelectorAll('button');

    expect(titleEl.textContent).toContain(mockData.title);
    expect(msgEl.textContent).toContain(mockData.message);
    expect(buttons[0].textContent).toContain('Cancel');
    expect(buttons[1].textContent).toContain('Delete');
  });

  // Simulate cancel button click and verify dialog closes with false
  it('should call dialogRef.close(false) when cancel button is clicked', () => {
    const cancelBtn = fixture.debugElement.queryAll(By.css('button'))[0];
    cancelBtn.triggerEventHandler('click', null);
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  // Simulate confirm button click and verify dialog closes with true
  it('should call dialogRef.close(true) when confirm button is clicked', () => {
    const confirmBtn = fixture.debugElement.queryAll(By.css('button'))[1];
    confirmBtn.triggerEventHandler('click', null);
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  // Ensure image is rendered when imageUrl is provided
  it('should show image if imageUrl is provided', () => {
    const imgEl = fixture.nativeElement.querySelector('img');
    expect(imgEl).toBeTruthy();
    expect(imgEl.getAttribute('src')).toBe(mockData.imageUrl);
  });

  // Ensure image is not rendered when imageUrl is undefined
  it('should not render image if imageUrl is not provided', () => {
    component.data.imageUrl = undefined;
    fixture.detectChanges();

    const imgEl = fixture.nativeElement.querySelector('img');
    expect(imgEl).toBeNull();
  });

  // Ensure default button labels are applied when config is missing
  it('should apply default button labels when none are provided', () => {
    component.data.confirmButtonConfig = {};
    component.data.cancelButtonConfig = {};
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].textContent).toContain('Cancel');
    expect(buttons[1].textContent).toContain('Delete');
  });

  // Confirm default label is used when only variant is provided
  it('should apply default label when confirmButtonConfig.label is missing', () => {
    component.data.confirmButtonConfig = { variant: 'primary' };
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[1].textContent).toContain('Delete');
  });

  // Ensures default labels and variants are applied when button config is missing in dialog input.
  it('should apply default labels and variants if missing in config', async () => {
    // Provide only partial button config (missing label and variant)
    const partialData = {
      title: 'Warning',
      message: 'Proceed without saving?',
      confirmButtonConfig: {}, // No label or variant
      cancelButtonConfig: {}, // No label or variant
    };

    // Mock dialogRef to satisfy dependency
    const dialogRefMock = {
      close: jest.fn(),
    };

    // Reset the TestBed to isolate this test from previous configurations
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [
          ConfirmationDialogComponent,
          CommonModule,
          MatDialogModule,
          MatButtonModule,
          OutlineButtonComponent,
          FilledButtonComponent,
        ],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: partialData },
          { provide: MatDialogRef, useValue: dialogRefMock },
        ],
      })
      .compileComponents();

    // Create and initialize the component
    const fixture = TestBed.createComponent(ConfirmationDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert that default labels and variants are applied correctly
    expect(component.data.confirmButtonConfig.label).toBe('Delete');
    expect(component.data.confirmButtonConfig.variant).toBe('secondary');
    expect(component.data.cancelButtonConfig.label).toBe('Cancel');
    expect(component.data.cancelButtonConfig.variant).toBe('secondary');
  });
});
