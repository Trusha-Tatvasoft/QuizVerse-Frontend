import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFoundComponent } from './not-found.component';
import { BehaviorSubject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

describe('UnauthorizedComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let routerMock: { navigate: jest.Mock };
  let authServiceMock: { currentRole$: BehaviorSubject<string | null> };

  beforeEach(async () => {
    routerMock = { navigate: jest.fn() };
    authServiceMock = { currentRole$: new BehaviorSubject<string | null>(null) };

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, MatIconModule, CommonModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('navigateToDashboard', () => {
    it('should not navigate if userRole is null', () => {
      component.userRole = null;
      component.navigateToDashboard();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to admin dashboard if role is admin', () => {
      component.userRole = 'admin';
      component.navigateToDashboard();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    });

    it('should navigate to player dashboard if role is player', () => {
      component.userRole = 'player';
      component.navigateToDashboard();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/user/dashboard']);
    });

    it('should not navigate for an unsupported role', () => {
      component.userRole = 'guest';
      component.navigateToDashboard();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('should call window.history.go(-2)', () => {
      const historySpy = jest.spyOn(window.history, 'go').mockImplementation(() => {});
      component.goBack();
      expect(historySpy).toHaveBeenCalledWith(-2);
      historySpy.mockRestore();
    });
  });
});
