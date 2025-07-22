import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SnackbarService, SnackbarComponent } from './snackbar.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let matSnackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    matSnackBarMock = {
      openFromComponent: jest.fn(),
      dismiss: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      providers: [SnackbarService, { provide: MatSnackBar, useValue: matSnackBarMock }],
    });

    service = TestBed.inject(SnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success snackbar', () => {
    service.showSuccess('Success Title', 'Success Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: { title: 'Success Title', message: 'Success Message' },
        panelClass: expect.arrayContaining(['styled-snackbar', 'success-snackbar']),
      }),
    );
  });

  it('should show error snackbar', () => {
    service.showError('Error Title', 'Error Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: { title: 'Error Title', message: 'Error Message' },
        panelClass: expect.arrayContaining(['styled-snackbar', 'error-snackbar']),
      }),
    );
  });

  it('should show warning snackbar', () => {
    service.showWarning('Warning Title', 'Warning Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: { title: 'Warning Title', message: 'Warning Message' },
        panelClass: expect.arrayContaining(['styled-snackbar', 'warning-snackbar']),
      }),
    );
  });

  it('should show info snackbar', () => {
    service.showInfo('Info Title', 'Info Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: { title: 'Info Title', message: 'Info Message' },
        panelClass: expect.arrayContaining(['styled-snackbar', 'info-snackbar']),
      }),
    );
  });

  it('should show snackbar without message and default class', () => {
    service['openSnackbar']('Title Only');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: { title: 'Title Only', message: undefined },
        panelClass: ['styled-snackbar'],
      }),
    );
  });

  it('should dismiss snackbar', () => {
    service.dismiss();
    expect(matSnackBarMock.dismiss).toHaveBeenCalled();
  });
});

describe('SnackbarComponent', () => {
  let fixture: ComponentFixture<SnackbarComponent>;
  let component: SnackbarComponent;
  let el: DebugElement;

  const defaultData = {
    title: 'Test Title',
    message: 'Test Message',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackbarComponent],
      providers: [
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: defaultData,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and message', () => {
    const title = el.query(By.css('.font-semibold')).nativeElement.textContent;
    const message = el.query(By.css('.text-sm.text-gray-700')).nativeElement.textContent;
    expect(title).toContain(defaultData.title);
    expect(message).toContain(defaultData.message);
  });

  it('should only render title if message is missing', () => {
    component.data.message = '';
    fixture.detectChanges();

    const message = el.query(By.css('.text-sm.text-gray-700'));
    expect(message).toBeNull();
  });
});
