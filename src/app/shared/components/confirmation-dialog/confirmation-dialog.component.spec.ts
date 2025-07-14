import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

describe('ConfirmationDialogComponent (Jest)', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let dialogRefMock: { close: jest.Mock };

  const mockData = {
    title: 'Delete Category',
    message: 'Are you sure you want to delete this category?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    imageUrl: 'assets/images/alert-triangle.svg',
  };

  beforeEach(async () => {
    dialogRefMock = {
      close: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent, CommonModule, MatDialogModule, MatButtonModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title, message, and buttons correctly', () => {
    const titleEl = fixture.nativeElement.querySelector('h2');
    const msgEl = fixture.nativeElement.querySelector('.message-text');
    const buttons = fixture.nativeElement.querySelectorAll('button');

    expect(titleEl.textContent).toContain(mockData.title);
    expect(msgEl.textContent).toContain(mockData.message);
    expect(buttons[0].textContent).toContain('Cancel');
    expect(buttons[1].textContent).toContain('Delete');
  });

  it('should call dialogRef.close(false) when cancel button is clicked', () => {
    const cancelBtn = fixture.debugElement.queryAll(By.css('button'))[0];
    cancelBtn.triggerEventHandler('click', null);
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should call dialogRef.close(true) when confirm button is clicked', () => {
    const confirmBtn = fixture.debugElement.queryAll(By.css('button'))[1];
    confirmBtn.triggerEventHandler('click', null);
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should show image if imageUrl is provided', () => {
    const imgEl = fixture.nativeElement.querySelector('img');
    expect(imgEl).toBeTruthy();
    expect(imgEl.getAttribute('src')).toBe(mockData.imageUrl);
  });

  it('should not render image if imageUrl is not provided', () => {
    component.data.imageUrl = undefined;
    fixture.detectChanges();

    const imgEl = fixture.nativeElement.querySelector('img');
    expect(imgEl).toBeNull();
  });

  it('should fallback to default button texts if not provided', () => {
    component.data.confirmText = undefined;
    component.data.cancelText = undefined;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].textContent).toContain('Cancel');
    expect(buttons[1].textContent).toContain('Delete');
  });
});
