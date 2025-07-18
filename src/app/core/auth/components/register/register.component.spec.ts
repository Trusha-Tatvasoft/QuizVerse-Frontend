import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test: Should create the component
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test: Should mark form as touched if invalid on submit
  it('should mark form as touched if invalid on submit', () => {
    const formSpy = jest.spyOn(component.registerForm, 'markAllAsTouched');
    component.onSubmit();
    expect(formSpy).toHaveBeenCalled();
  });

  // Test: Should simulate loading and stop after timeout on valid submit
  it('should simulate loading and log form values on valid submit', fakeAsync(() => {
    component.registerForm.setValue({
      fullName: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });

    component.onSubmit();
    expect(component.isLoading).toBe(true);

    tick(1000);

    expect(component.isLoading).toBe(false);
    expect(component.registerForm.value).toEqual({
      fullName: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
  }));

  // Test: Should disable the button when loading
  it('should disable the button when loading', () => {
    component.isLoading = true;
    expect(component.buttonConfig.isDisabled).toBe(true);
  });

  // Test: Should enable the button when not loading
  it('should enable the button when not loading', () => {
    component.isLoading = false;
    expect(component.buttonConfig.isDisabled).toBe(false);
  });

  // Test: Should initialize form fields correctly
  it('should initialize form fields correctly', () => {
    const controls = component.registerForm.controls;
    expect(controls['fullName']).toBeDefined();
    expect(controls['email']).toBeDefined();
    expect(controls['password']).toBeDefined();
  });

  // Test: Should display the correct register button label
  it('should display the correct register button label', () => {
    expect(component.registerButton.label).toBe('Create An Account');
  });
});
