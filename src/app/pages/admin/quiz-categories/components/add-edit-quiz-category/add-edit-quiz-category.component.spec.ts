import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddEditQuizCategoryComponent } from './add-edit-quiz-category.component';
import { QuizCategoryManagementService } from '../../../../../services/admin/quiz-category-management/quiz-category-management.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { ValidationErrorService } from '../../../../../shared/service/validation-error/validation-error.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { defaultIcon, platformMessages } from '../../../../../utils/constants';
import { QuizCategoryList } from '../../interface/quiz-category-list-data.interface';

describe('AddEditQuizCategoryComponent', () => {
  let component: AddEditQuizCategoryComponent;
  let fixture: ComponentFixture<AddEditQuizCategoryComponent>;
  let quizServiceMock: any;
  let snackbarMock: any;
  let validationErrorServiceMock: any;

  beforeEach(async () => {
    quizServiceMock = {
      checkQuizCategoryNameAvailable: jest.fn(),
      createOrUpdateQuizCategory: jest.fn(),
    };
    snackbarMock = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    };
    validationErrorServiceMock = {
      getErrorMessage: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AddEditQuizCategoryComponent],
      providers: [
        { provide: QuizCategoryManagementService, useValue: quizServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: ValidationErrorService, useValue: validationErrorServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditQuizCategoryComponent);
    component = fixture.componentInstance;

    component.data = {
      id: 1,
      categoryName: 'Test',
      description: 'Desc',
      icon: 'icon1',
      isActive: true,
      createdDate: '',
      quizCount: 0,
    };
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ---------------- ngOnInit ----------------
  it('should initialize form and set icon when data is provided', () => {
    fixture.detectChanges();
    expect(component.categoryForm.value).toEqual({
      name: 'Test',
      description: 'Desc',
      icon: 'icon1',
    });
    const iconField = component.categoryFields.find((f) => f.name === 'icon');
    expect(iconField?.icon).toBe('icon1');
  });

  it('should reset icon to defaultIcon when no icon is provided in data', () => {
    component.data = {
      ...component.data!,
      icon: null,
    } as QuizCategoryList;
    fixture.detectChanges();

    const iconField = component.categoryFields.find((f) => f.name === 'icon');
    expect(iconField?.icon).toBe(defaultIcon);
  });

  it('should update icon field when form value changes', fakeAsync(() => {
    fixture.detectChanges();
    const iconField = component.categoryFields.find((f) => f.name === 'icon');

    component.categoryForm.get('icon')?.setValue(null);
    tick();

    expect(iconField?.icon).toBe(defaultIcon);
  }));

  // ---------------- validateName ----------------
  it('should call checkQuizCategoryNameAvailable if name control has a valid value', fakeAsync(() => {
    component.categoryForm.get('name')?.setValue('UniqueName');
    quizServiceMock.checkQuizCategoryNameAvailable.mockReturnValue(of(true));

    component.validateName();
    tick();

    expect(quizServiceMock.checkQuizCategoryNameAvailable.mock.calls[0][0]).toBe('UniqueName');
  }));

  it('should not validate name if control is invalid or empty', () => {
    component.categoryForm.get('name')?.setValue('');
    const spy = jest.spyOn(quizServiceMock, 'checkQuizCategoryNameAvailable');
    component.validateName();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should clear server error if name is available and control had server error', fakeAsync(() => {
    fixture.detectChanges();
    const control = component.categoryForm.get('name');
    control?.setErrors({ server: true });
    component.serverErrors['name'] = 'Old error';

    quizServiceMock.checkQuizCategoryNameAvailable.mockReturnValue(of(true));

    component.categoryForm.get('name')?.setValue('Unique');
    component.validateName();
    tick();

    expect(component.serverErrors['name']).toBe('');
  }));

  it('should set server error when service throws in validateName', fakeAsync(() => {
    quizServiceMock.checkQuizCategoryNameAvailable.mockReturnValue(
      throwError(() => ({ error: { message: 'Name already exists' } })),
    );

    component.categoryForm.get('name')?.setValue('Duplicate');
    component.validateName();
    tick();

    expect(component.serverErrors['name']).toBe('Name already exists');
    expect(component.categoryForm.get('name')?.hasError('server')).toBe(true);
  }));

  // ---------------- getError ----------------
  it('should get error message from validation service', () => {
    validationErrorServiceMock.getErrorMessage.mockReturnValue('Validation Error');
    component.categoryForm.get('name')?.setErrors({ required: true });

    const errorMsg = component.getError('name');
    expect(errorMsg).toBe('Validation Error');
    expect(validationErrorServiceMock.getErrorMessage).toHaveBeenCalled();
  });

  it('should return server error message from getError when server error exists', () => {
    component.serverErrors['name'] = 'Server says no';
    component.categoryForm.get('name')?.setErrors({ server: true });

    const errorMsg = component.getError('name');
    expect(errorMsg).toBe('Server says no');
  });

  // ---------------- onSubmit ----------------
  it('should mark form as touched and not call API when form is invalid on submit', () => {
    component.categoryForm.get('name')?.setValue(''); // required missing
    component.onSubmit();

    expect(component.categoryForm.touched).toBe(true);
    expect(quizServiceMock.createOrUpdateQuizCategory).not.toHaveBeenCalled();
  });

  it('should show success snackbar and emit close event on successful submit', fakeAsync(() => {
    quizServiceMock.createOrUpdateQuizCategory.mockReturnValue(
      of({ result: true, statusCode: 200, message: 'Success' }),
    );
    component.categoryForm.get('name')?.setValue('ValidName');
    component.categoryForm.get('description')?.setValue('Desc');
    component.categoryForm.get('icon')?.setValue(defaultIcon);

    const closeSpy = jest.spyOn(component.close, 'emit');

    component.onSubmit();
    tick();

    expect(snackbarMock.showSuccess).toHaveBeenCalledWith(platformMessages.successTitle, 'Success');
    expect(closeSpy).toHaveBeenCalledWith({ refresh: true });
  }));

  it('should show error snackbar if API returns result false', fakeAsync(() => {
    quizServiceMock.createOrUpdateQuizCategory.mockReturnValue(
      of({ result: false, statusCode: 400, message: 'Bad Request' }),
    );
    component.categoryForm.get('name')?.setValue('Invalid');
    component.categoryForm.get('description')?.setValue('Desc');
    component.categoryForm.get('icon')?.setValue('icon1');

    const closeSpy = jest.spyOn(component.close, 'emit');

    component.onSubmit();
    tick();

    expect(snackbarMock.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Bad Request');
    expect(closeSpy).not.toHaveBeenCalled();
  }));

  it('should show error snackbar on API error', fakeAsync(() => {
    quizServiceMock.createOrUpdateQuizCategory.mockReturnValue(
      throwError(() => new Error('API Error')),
    );
    component.categoryForm.get('name')?.setValue('ValidName');
    component.categoryForm.get('description')?.setValue('Desc');
    component.categoryForm.get('icon')?.setValue('newIcon');

    const closeSpy = jest.spyOn(component.close, 'emit');

    component.onSubmit();
    tick();

    expect(snackbarMock.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
    expect(closeSpy).not.toHaveBeenCalled();
  }));

  // ---------------- resetCategoryForm ----------------
  it('should reset form and icon to default on resetCategoryForm', () => {
    component.categoryForm.get('name')?.setValue('Something');
    component.resetCategoryForm();

    expect(component.categoryForm.value).toEqual({
      name: '',
      description: '',
      icon: defaultIcon,
    });

    const iconField = component.categoryFields.find((f) => f.name === 'icon');
    expect(iconField?.icon).toBe(defaultIcon);
  });

  // ---------------- onCancel ----------------
  it('should reset form and emit close event with refresh false on cancel', () => {
    const closeSpy = jest.spyOn(component.close, 'emit');
    component.onCancel();

    expect(closeSpy).toHaveBeenCalledWith({ refresh: false });
    expect(component.categoryForm.value.icon).toBe(defaultIcon);
  });
});
