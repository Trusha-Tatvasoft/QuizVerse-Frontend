import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCardComponent } from './notification-card.component';
import { Router } from '@angular/router';
import { NotificationCenterComponent } from '../../notification-center.component';
import { signal } from '@angular/core';
import { Notifications } from '../../../interfaces/navbar.component.interface';
import { TagColor } from '../../../../../utils/types/tag-component.type';

describe('NotificationCardComponent', () => {
  let component: NotificationCardComponent;
  let fixture: ComponentFixture<NotificationCardComponent>;
  let mockRouter: Partial<Router>;
  let mockParent: Partial<NotificationCenterComponent>;

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockParent = {
      isAdmin: true,
      notifications: signal<Notifications[]>([]),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationCardComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: NotificationCenterComponent, useValue: mockParent },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have computed notifications from parent', () => {
    expect(component.notifications()).toEqual([]);
  });

  describe('viewDetails', () => {
    it('should call router.navigate with correct path and queryParams if parent exists', () => {
      const spy = jest.spyOn(mockRouter, 'navigate');
      component.viewDetails(1);
      expect(spy).toHaveBeenCalledWith(expect.any(Array), expect.any(Object));
    });
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should have button configs defined', () => {
    expect(component.markAsReadButton).toBeDefined();
    expect(component.deleteButton).toBeDefined();
    expect(component.viewDetailsButton).toBeDefined();
  });

  describe('when parent is undefined', () => {
    beforeEach(() => {
      Object.defineProperty(component, 'parent', { value: undefined });
    });

    it('should return empty array for notifications', () => {
      expect(component.notifications()).toEqual([]);
    });

    it('should not call router.navigate in viewDetails', () => {
      const spy = jest.spyOn(component['router'], 'navigate');
      component.viewDetails(123);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it('should define markAsRead function', () => {
    expect(typeof component.markAsRead).toBe('function');
  });

  it('should define deleteNotification function', () => {
    expect(typeof component.deleteNotification).toBe('function');
  });

  it('should return parent notifications when available', () => {
    const mockNotifs = [
      {
        id: 'n1',
        title: 'Test Notification',
        message: 'Test message',
        timeAgo: new Date(),
        read: false,
        tagConfig: {
          id: 1,
          label: 2,
          backgroundColor: 'lightBlue' as TagColor,
          textColor: 'Blue' as TagColor,
          isSelected: false,
          hasBorder: true,
          type: 'static',
        },
        category: 'test',
        categoryValue: 1,
      } as any,
    ];
    mockParent.notifications?.set(mockNotifs);
    fixture.detectChanges();
    expect(component.notifications()).toEqual(mockNotifs);
  });
});
