import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatSnackBar, MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarService, SnackbarComponent } from './snackbar.service';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let matSnackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    matSnackBarMock = {
      openFromComponent: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      providers: [SnackbarService, { provide: MatSnackBar, useValue: matSnackBarMock }],
    });

    service = TestBed.inject(SnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success snackbar with correct type', () => {
    service.showSuccess('Success Title', 'Success Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: {
          title: 'Success Title',
          message: 'Success Message',
          type: 'success',
        },
        panelClass: expect.arrayContaining(['styled-snackbar', 'success']),
      }),
    );
  });

  it('should show error snackbar with correct type', () => {
    service.showError('Error Title', 'Error Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: {
          title: 'Error Title',
          message: 'Error Message',
          type: 'error',
        },
        panelClass: expect.arrayContaining(['styled-snackbar', 'error']),
      }),
    );
  });

  it('should show warning snackbar with correct type', () => {
    service.showWarning('Warning Title', 'Warning Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: {
          title: 'Warning Title',
          message: 'Warning Message',
          type: 'warning',
        },
        panelClass: expect.arrayContaining(['styled-snackbar', 'warning']),
      }),
    );
  });
  it('should show info snackbar with correct type', () => {
    service.showInfo('Info Title', 'Info Message');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: {
          title: 'Info Title',
          message: 'Info Message',
          type: 'info',
        },
        panelClass: expect.arrayContaining(['styled-snackbar', 'info']),
      }),
    );
  });

  it('should show success snackbar without message', () => {
    service.showSuccess('Title Only');
    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: {
          title: 'Title Only',
          message: undefined,
          type: 'success',
        },
        panelClass: expect.arrayContaining(['styled-snackbar', 'success']),
      }),
    );
  });

  it('should merge default panel class with custom ones', () => {
    service.openSnackbar('Title', 'Message', 'success', ['custom-class', 'another-class']);

    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        panelClass: expect.arrayContaining(['styled-snackbar', 'custom-class', 'another-class']),
        data: {
          title: 'Title',
          message: 'Message',
          type: 'success',
        },
      }),
    );
  });
  it('should handle undefined panelClass', () => {
    service.openSnackbar('Title', 'Message', 'info', undefined);

    expect(matSnackBarMock.openFromComponent).toHaveBeenCalledWith(
      SnackbarComponent,
      expect.objectContaining({
        data: {
          title: 'Title',
          message: 'Message',
          type: 'info',
        },
        panelClass: expect.arrayContaining(['styled-snackbar']),
      }),
    );
  });
});

describe('SnackbarComponent', () => {
  let component: SnackbarComponent;
  let fixture: ComponentFixture<SnackbarComponent>;
  let snackBarRefMock: jest.Mocked<MatSnackBarRef<SnackbarComponent>>;

  beforeEach(async () => {
    snackBarRefMock = {
      dismiss: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBarRef<SnackbarComponent>>;

    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, SnackbarComponent],
      providers: [
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: { title: 'Test Title', message: 'Test Message', type: 'success' },
        },
        { provide: MatSnackBarRef, useValue: snackBarRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title and message', () => {
    const titleEl = fixture.debugElement.query(By.css('.font-bold')).nativeElement;
    const messageEl = fixture.debugElement.query(By.css('.break-all')).nativeElement;

    expect(titleEl.textContent).toContain('Test Title');
    expect(messageEl.textContent).toContain('Test Message');
  });

  it('should not show message div if message is missing', () => {
    component.data.message = '';
    fixture.detectChanges();

    const messageEl = fixture.debugElement.query(By.css('.wrap-break-word'));
    expect(messageEl).toBeNull();
  });

  it('should return the correct icon based on type', () => {
    component.data.type = 'success';
    expect(component.getIcon()).toBe('check_circle');

    component.data.type = 'error';
    expect(component.getIcon()).toBe('error');

    component.data.type = 'warning';
    expect(component.getIcon()).toBe('warning');

    component.data.type = 'info';
    expect(component.getIcon()).toBe('info');

    component.data.type = 'unknown';
    expect(component.getIcon()).toBe('info');
  });

  it('should default to info icon when type is undefined', () => {
    component.data.type = undefined as any;
    expect(component.getIcon()).toBe('info');
  });

  it('should handle missing title', () => {
    component.data.title = '';
    fixture.detectChanges();
    const titleEl = fixture.debugElement.query(By.css('.font-bold')).nativeElement;
    expect(titleEl.textContent).toBe('');
  });

  it('should dismiss the snackbar when close() is called', () => {
    component.close();
    expect(snackBarRefMock.dismiss).toHaveBeenCalled();
  });

  it('should call close() when close button is clicked', () => {
    const closeBtn = fixture.debugElement.query(By.css('button')).nativeElement;
    closeBtn.click();
    expect(snackBarRefMock.dismiss).toHaveBeenCalled();
  });
});
