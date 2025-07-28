import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MasterLayoutComponent } from './master-layout.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  template: '',
  standalone: true,
})
class MockNavbarComponent {
  sidebarClosedByBackdrop() {}
}

@Component({
  selector: 'app-sidebar',
  template: '',
  standalone: true,
})
class MockSidebarComponent {
  toggleSidebar() {}
  openSidebar() {}
  closeSidebar() {}
}

describe('MasterLayoutComponent', () => {
  let component: MasterLayoutComponent;
  let fixture: ComponentFixture<MasterLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MasterLayoutComponent,
        MockNavbarComponent,
        MockSidebarComponent,
        RouterTestingModule,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MasterLayoutComponent);
    component = fixture.componentInstance;
    component.navbar = TestBed.createComponent(MockNavbarComponent)
      .componentInstance as unknown as NavbarComponent;
    component.sidebar = TestBed.createComponent(MockSidebarComponent)
      .componentInstance as unknown as SidebarComponent;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call sidebar.toggleSidebar() from toggleSidebarFromParent()', () => {
    const toggleSpy = jest.spyOn(component.sidebar, 'toggleSidebar');
    component.toggleSidebarFromParent();
    expect(toggleSpy).toHaveBeenCalled();
  });

  it('should call sidebar.openSidebar() from handleSidebarOpen()', () => {
    const openSpy = jest.spyOn(component.sidebar, 'openSidebar');
    component.handleSidebarOpen();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should call sidebar.closeSidebar() from handleSidebarClose()', () => {
    const closeSpy = jest.spyOn(component.sidebar, 'closeSidebar');
    component.handleSidebarClose();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should call navbar.sidebarClosedByBackdrop() from handleSidebarClosedByBackdrop()', () => {
    const backdropSpy = jest.spyOn(component.navbar, 'sidebarClosedByBackdrop');
    component.handleSidebarClosedByBackdrop();
    expect(backdropSpy).toHaveBeenCalled();
  });
});
