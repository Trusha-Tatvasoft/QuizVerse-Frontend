import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IncomingRequestNotificationComponent } from './incoming-request-notification.component';
import { IncomingBattleRequest } from '../../interfaces/incoming-battle-request.interface';
import { TagInputConfig } from '../../interfaces/tag-component.interface';
import { getTagConfigWithDifficulty } from '../../../utils/quiz-crud-common-functions.utils';

describe('IncomingRequestNotificationComponent', () => {
  let component: IncomingRequestNotificationComponent;
  let fixture: ComponentFixture<IncomingRequestNotificationComponent>;

  const mockRequest: IncomingBattleRequest = {
    requestId: 1,
    senderUserName: 'john_doe',
    senderFullName: 'John Doe',
    senderProfilePic: 'https://example.com/avatar.jpg',
    battleName: 'Battle of Minds',
    battleCategory: 'General Knowledge',
    battleDifficulty: 'Medium',
    sendingDate: new Date(),
    timeAgo: '2 minutes ago',
  };

  const defaultTagConfig: TagInputConfig = {
    id: 'medium', // or a generic 'default' if you prefer
    label: 'Medium',
    type: 'static',
    isSelected: false,
    hasBorder: false,
    backgroundColor: 'lightOrange',
    textColor: 'orange',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomingRequestNotificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomingRequestNotificationComponent);
    component = fixture.componentInstance;
    component.request = mockRequest;
    fixture.detectChanges();
  });

  afterAll(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize difficultyTag using battleDifficulty', () => {
    const expectedTag: TagInputConfig = getTagConfigWithDifficulty('Medium');
    component.ngOnInit();
    expect(component.difficultyTag.backgroundColor).toEqual(expectedTag.backgroundColor);
    expect(component.difficultyTag.textColor).toEqual(expectedTag.textColor);
  });

  it('should set defaultTagConfig if no difficulty provided', () => {
    component.request.battleDifficulty = undefined as any;
    component.ngOnInit();
    expect(component.difficultyTag).toEqual(defaultTagConfig);
  });

  it('should set isVisible to true after delay', fakeAsync(() => {
    component.isVisible = false;
    component.ngOnInit();
    tick(60);
    expect(component.isVisible).toBeTruthy();
  }));

  it('should return correct initials for full name', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
  });

  it('should return single initial for one-word name', () => {
    expect(component.getInitials('John')).toBe('J');
  });

  it('should handle empty name safely', () => {
    expect(component.getInitials('')).toBe('');
  });

  it('should generate deterministic color class', () => {
    const colorClass = component.getInitialsColorClass('John Doe');
    expect(colorClass).toMatch(/^bg-avatar-\d+$/);
  });

  it('should set isImageError to true on image error', () => {
    component.isImageError = false;
    component.onImageError();
    expect(component.isImageError).toBeTruthy();
  });

  it('should not emit accept event if isVisible is false', () => {
    component.isVisible = false;
    const emitSpy = jest.spyOn(component.accept, 'emit');
    component.onAccept();
    jest.advanceTimersByTime(400);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit decline event if isVisible is false', () => {
    component.isVisible = false;
    const emitSpy = jest.spyOn(component.decline, 'emit');
    component.onDecline();
    jest.advanceTimersByTime(400);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit dismiss event if isVisible is false', () => {
    component.isVisible = false;
    const emitSpy = jest.spyOn(component.dismiss, 'emit');
    component.onDismiss();
    jest.advanceTimersByTime(400);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should call startHideAnimation with callback on accept', () => {
    const spy = jest.spyOn(component, 'startHideAnimation');
    component.onAccept();
    expect(spy).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call startHideAnimation with callback on decline', () => {
    const spy = jest.spyOn(component, 'startHideAnimation');
    component.onDecline();
    expect(spy).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call startHideAnimation with callback on dismiss', () => {
    const spy = jest.spyOn(component, 'startHideAnimation');
    component.onDismiss();
    expect(spy).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should not change isVisible if already false in startHideAnimation', () => {
    component.isVisible = false;
    const callback = jest.fn();
    component.startHideAnimation(callback);
    expect(component.isVisible).toBe(false);
    jest.advanceTimersByTime(400);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should not trigger hide animation twice', fakeAsync(() => {
    const emitSpy = jest.spyOn(component.accept, 'emit');
    component.isVisible = false;
    component.onAccept();
    tick(400);
    expect(emitSpy).not.toHaveBeenCalled();
  }));
});
