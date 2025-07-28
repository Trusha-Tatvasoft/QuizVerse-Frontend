import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';
import { LoaderService } from '../../../../shared/service/loader/loader.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let loaderService: LoaderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    fixture.detectChanges();
  });

  // Should create the component
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Should mark form as touched if it's invalid on submit
  it('should mark form as touched if invalid on submit', () => {
    const markSpy = jest.spyOn(component.registerForm, 'markAllAsTouched');
    const loaderSpy = jest.spyOn(loaderService, 'show');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
    expect(loaderSpy).not.toHaveBeenCalled();
  });

  // Should show and hide loader when form is valid
  it('should call loader service on valid submit', fakeAsync(() => {
    const showSpy = jest.spyOn(loaderService, 'show');
    const hideSpy = jest.spyOn(loaderService, 'hide');

    component.registerForm.setValue({
      fullName: 'New User',
      email: 'new@example.com',
      password: 'Password@123',
    });

    component.onSubmit();

    expect(showSpy).toHaveBeenCalled();

    tick(1000);

    expect(hideSpy).toHaveBeenCalled();
    expect(component.registerForm.value).toEqual({
      fullName: 'New User',
      email: 'new@example.com',
      password: 'Password@123',
    });
  }));

  // Should initialize form fields correctly
  it('should initialize form fields correctly', () => {
    const controls = component.registerForm.controls;
    expect(controls['fullName']).toBeDefined();
    expect(controls['email']).toBeDefined();
    expect(controls['password']).toBeDefined();
  });

  // Should display the correct register button label
  it('should display the correct register button label', () => {
    expect(component.registerButton.label).toBe('Create An Account');
  });
});
