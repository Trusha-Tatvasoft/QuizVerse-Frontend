import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form as touched if invalid on submit', () => {
    const formSpy = jest.spyOn(component.registerForm, 'markAllAsTouched');
    component.onSubmit();
    expect(formSpy).toHaveBeenCalled();
  });

  it('should simulate loading and log form values on valid submit', fakeAsync(() => {
    component.registerForm.setValue({
      fullName: 'New User',
      email: 'new@example.com',
      password: 'Password@123',
    });

    component.onSubmit();
    expect(component.isLoading).toBe(true);

    tick(1000);
    expect(component.isLoading).toBe(false);

    expect(component.registerForm.value).toEqual({
      fullName: 'New User',
      email: 'new@example.com',
      password: 'Password@123',
    });
  }));

  it('should disable the button when loading', () => {
    component.isLoading = true;
    expect(component.buttonConfig.isDisabled).toBe(true);
  });

  it('should enable the button when not loading', () => {
    component.isLoading = false;
    expect(component.buttonConfig.isDisabled).toBe(false);
  });

  it('should initialize form fields correctly', () => {
    const controls = component.registerForm.controls;
    expect(controls['fullName']).toBeDefined();
    expect(controls['email']).toBeDefined();
    expect(controls['password']).toBeDefined();
  });

  it('should display the correct register button label', () => {
    expect(component.registerButton.label).toBe('Create An Account');
  });
});
