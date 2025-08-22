import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionFormDialogComponent } from './question-form-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { questionFormDialogTabConfig } from '../../configs/question-pool-tab-config';

describe('QuestionFormDialogComponent (Jest)', () => {
  let component: QuestionFormDialogComponent;
  let fixture: ComponentFixture<QuestionFormDialogComponent>;
  let mockDialogRef: { close: jest.Mock };

  beforeEach(async () => {
    mockDialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [QuestionFormDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null }, // default case
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('mode initialization', () => {
    it('should default mode to "create" if no data provided', () => {
      expect(component.mode).toBe('create');
    });

    it('should set mode to "edit" if provided in MAT_DIALOG_DATA', async () => {
      await TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [QuestionFormDialogComponent],
          providers: [
            { provide: MatDialogRef, useValue: mockDialogRef },
            { provide: MAT_DIALOG_DATA, useValue: { mode: 'edit' } },
          ],
        })
        .compileComponents();

      const customFixture = TestBed.createComponent(QuestionFormDialogComponent);
      const instance = customFixture.componentInstance;
      expect(instance.mode).toBe('edit');
    });
  });

  describe('tabs', () => {
    it('should initialize tabs from config', () => {
      expect(component.tabs).toBe(questionFormDialogTabConfig);
    });

    it('should switch tabs correctly', () => {
      expect(component.selectedIndex()).toBe(0);
      component.switchToTab(2);
      expect(component.selectedIndex()).toBe(2);
    });
  });

  describe('closeDialog', () => {
    it('should call dialogRef.close()', () => {
      component.closeDialog();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
