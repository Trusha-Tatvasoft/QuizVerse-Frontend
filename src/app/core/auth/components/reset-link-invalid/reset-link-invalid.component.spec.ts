import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResetLinkInvalidComponent } from './reset-link-invalid.component';
import { Routes, Router } from '@angular/router';
import { Navigations } from '../../../../shared/enums/navigation';

const dummyRoutes: Routes = [];

describe('ResetLinkInvalidComponent', () => {
  let component: ResetLinkInvalidComponent;
  let fixture: ComponentFixture<ResetLinkInvalidComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetLinkInvalidComponent],
      providers: [provideRouter(dummyRoutes)],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetLinkInvalidComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to ForgotPassword on "Request New Reset Link" click', () => {
    component.onRequestNewResetLink();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.ForgetPassword]);
  });

  it('should navigate to Login on "Back to Sign In" click', () => {
    component.onBackToSignInClick();
    expect(router.navigate).toHaveBeenCalledWith([Navigations.Login]);
  });

  it('should have NewResetLinkButton config defined', () => {
    expect(component.NewResetLinkButton).toBeDefined();
  });

  it('should have BackToSignInButton config defined', () => {
    expect(component.BackToSignInButton).toBeDefined();
  });
});
