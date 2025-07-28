import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideRouter } from '@angular/router';
import { LoaderService } from '../../../../shared/service/loader/loader.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loaderService: LoaderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    fixture.detectChanges();
  });

  // Should create the component
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Should mark form as touched if invalid on submit
  it('should mark form as touched if invalid on submit', () => {
    const markSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');
    const loaderSpy = jest.spyOn(loaderService, 'show');

    component.onSubmit();

    expect(markSpy).toHaveBeenCalled();
    expect(loaderSpy).not.toHaveBeenCalled();
  });

  // Should show loader and stop it after timeout on valid submit
  it('should show loader and stop it after timeout on valid submit', fakeAsync(() => {
    const showSpy = jest.spyOn(loaderService, 'show');
    const hideSpy = jest.spyOn(loaderService, 'hide');

    component.loginForm.setValue({
      email: 'john@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(showSpy).toHaveBeenCalled();

    tick(1000);

    expect(hideSpy).toHaveBeenCalled();
    expect(component.loginForm.value).toEqual({
      email: 'john@example.com',
      password: 'password123',
    });
  }));

  // Should initialize form fields correctly
  it('should initialize form fields correctly', () => {
    const controls = component.loginForm.controls;
    expect(controls['email']).toBeDefined();
    expect(controls['password']).toBeDefined();
  });

  // Should display the correct sign-in button label
  it('should display the correct sign-in button label', () => {
    expect(component.signInButton.label).toBe('Sign In');
  });
});
