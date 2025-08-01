import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MasterLayoutComponent } from './master-layout.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../../core/auth/services/auth.service';
import { of, Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

// Dummy sidebar and navbar for ViewChild interaction
@Component({ selector: 'app-sidebar', template: '' })
class MockSidebarComponent {
  openSidebar = jest.fn();
  closeSidebar = jest.fn();
  toggleSidebar = jest.fn();
}

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent {
  sidebarClosedByBackdrop = jest.fn();
}

describe('MasterLayoutComponent', () => {
  let component: MasterLayoutComponent;
  let fixture: ComponentFixture<MasterLayoutComponent>;
  let authServiceMock: any;
  let roleSubject: Subject<string>;

  beforeEach(async () => {
    roleSubject = new Subject<string>();

    authServiceMock = {
      currentRole$: roleSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [
        MasterLayoutComponent,
        MockSidebarComponent,
        MockNavbarComponent,
        RouterTestingModule,
      ],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the master layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should update role and sidebarItems when currentRole$ emits "admin"', () => {
    roleSubject.next('admin');
    fixture.detectChanges();

    expect(component.role).toBe('admin');
    expect(component.sidebarItems).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: expect.any(String) })]),
    );
  });

  it('should update role and sidebarItems when currentRole$ emits "player"', () => {
    roleSubject.next('player');
    fixture.detectChanges();

    expect(component.role).toBe('player');
    expect(component.sidebarItems.some((item) => item.label === 'Profile')).toBe(false);
  });

  it('should call sidebar methods', () => {
    const sidebar = {
      openSidebar: jest.fn(),
      closeSidebar: jest.fn(),
      toggleSidebar: jest.fn(),
    } as unknown as SidebarComponent;
    component.sidebar = sidebar;

    component.handleSidebarOpen();
    expect(sidebar.openSidebar).toHaveBeenCalled();

    component.handleSidebarClose();
    expect(sidebar.closeSidebar).toHaveBeenCalled();

    component.toggleSidebarFromParent();
    expect(sidebar.toggleSidebar).toHaveBeenCalled();
  });

  it('should call navbar.sidebarClosedByBackdrop when handleSidebarClosedByBackdrop is called', () => {
    const navbar = {
      sidebarClosedByBackdrop: jest.fn(),
    } as unknown as NavbarComponent;
    component.navbar = navbar;

    component.handleSidebarClosedByBackdrop();
    expect(navbar.sidebarClosedByBackdrop).toHaveBeenCalled();
  });

  it('should clean up subscriptions on ngOnDestroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
