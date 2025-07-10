import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  const mockData = {
    title: 'Delete Category',
    message: 'Are you sure you want to delete this category?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    imageUrl: 'https://example.com/icon.png',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent, CommonModule, MatDialogModule, MatButtonModule],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: mockData }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.confirm, 'emit');
    jest.spyOn(component.cancel, 'emit');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title, message, and buttons correctly', () => {
    const titleEl = fixture.nativeElement.querySelector('h2');
    const msgEl = fixture.nativeElement.querySelector('.message-text');
    const cancelBtn = fixture.nativeElement.querySelector('button:nth-child(1)');
    const confirmBtn = fixture.nativeElement.querySelector('button:nth-child(2)');

    expect(titleEl.textContent).toContain(mockData.title);
    expect(msgEl.textContent).toContain(mockData.message);
    expect(cancelBtn.textContent).toContain('Cancel');
    expect(confirmBtn.textContent).toContain('Delete');
  });

  it('should emit cancel event when cancel button is clicked', () => {
    const cancelBtn = fixture.debugElement.query(By.css('button:nth-child(1)'));
    cancelBtn.triggerEventHandler('click', null);
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should emit confirm event when confirm button is clicked', () => {
    const confirmBtn = fixture.debugElement.query(By.css('button:nth-child(2)'));
    confirmBtn.triggerEventHandler('click', null);
    expect(component.confirm.emit).toHaveBeenCalled();
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
});
