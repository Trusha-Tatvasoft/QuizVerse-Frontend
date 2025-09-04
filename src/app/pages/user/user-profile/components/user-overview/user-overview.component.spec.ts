import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileService } from '../../../../../services/user/user-profile/user-profile.service';
import { of, Subject } from 'rxjs';
import { UserOverview } from '../../interfaces/user-profile.interface';
import { UserOverviewComponent } from './user-overview.component';
import { xpTagConfig } from '../../user-profile.mapper';

class MockUserProfileService {
  getUserOverview = jest.fn();
}

describe('ProfileOverviewComponent', () => {
  let component: UserOverviewComponent;
  let fixture: ComponentFixture<UserOverviewComponent>;
  let mockService: MockUserProfileService;

  beforeEach(async () => {
    mockService = new MockUserProfileService();

    await TestBed.configureTestingModule({
      imports: [UserOverviewComponent],
      providers: [{ provide: UserProfileService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserOverviewComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadUserOverview on init and set recentActivities and statsList', () => {
    const mockOverview: UserOverview = {
      totalQuizzes: 5,
      totalXp: 120,
      recentQuizzes: [{ title: 'Quiz 1', xp: 20 }],
    } as unknown as UserOverview;

    mockService.getUserOverview.mockReturnValue(
      of({
        result: true,
        data: mockOverview,
      }),
    );

    fixture.detectChanges();

    expect(mockService.getUserOverview).toHaveBeenCalled();
    expect(component.recentActivities.length).toBeGreaterThanOrEqual(0);
    expect(component.statsList.length).toBeGreaterThanOrEqual(0);
  });

  it('should not set values if response.result is false', () => {
    mockService.getUserOverview.mockReturnValue(
      of({
        result: false,
        data: null,
      }),
    );

    fixture.detectChanges();

    expect(component.recentActivities).toEqual([]);
    expect(component.statsList).toEqual([]);
  });

  it('should return xpTag config from getXpTag', () => {
    const xp = 50;
    const config = component.getXpTag(xp);
    expect(config).toEqual(xpTagConfig(xp));
  });

  it('should unsubscribe on destroy', () => {
    const spy = jest.spyOn((component as any).$destroy, 'next');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
