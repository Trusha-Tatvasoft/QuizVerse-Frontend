import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserFormDialogComponent', () => {
  let component: UserFormDialogComponent;
  let fixture: ComponentFixture<UserFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormDialogComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dialog Header', () => {
    it('should show "Add New User" title when user is null (Add mode)', () => {
      component.user = null;
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('#dialog-title')).nativeElement;
      const desc = fixture.debugElement.query(By.css('#dialog-description')).nativeElement;

      expect(title.textContent).toContain('Add New User');
      expect(desc.textContent).toContain('Create a new user account');
    });

    it('should show "Edit User" title when user is present (Edit mode)', () => {
      component.user = {
        id: 1,
        fullName: 'John',
        userName: 'john_doe',
        email: 'john.doe@example.com',
        password: 'password123',
        bio: 'A brief bio about John',
        profilePic: 'path/to/profile-pic.jpg',
      };
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('#dialog-title')).nativeElement;
      const desc = fixture.debugElement.query(By.css('#dialog-description')).nativeElement;

      expect(title.textContent).toContain('Edit User');
      expect(desc.textContent).toContain('Update the user details below');
    });
  });

  describe('Dialog Interactions', () => {
    it('should emit closeDialog when close button is clicked', () => {
      const closeSpy = jest.spyOn(component.closeDialog, 'emit');

      const closeButton = fixture.debugElement.query(By.css('.close-btn-dialog-all'));
      closeButton.triggerEventHandler('click');

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should emit closeDialog on backdrop click', () => {
      const closeSpy = jest.spyOn(component.closeDialog, 'emit');

      const backdrop = fixture.debugElement.query(By.css('.dialog-overlay'));
      const event = { target: backdrop.nativeElement, currentTarget: backdrop.nativeElement };
      backdrop.triggerEventHandler('click', event);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should NOT emit closeDialog if non-backdrop area is clicked', () => {
      const closeSpy = jest.spyOn(component.closeDialog, 'emit');

      const content = fixture.debugElement.query(By.css('.dialog-content'));
      const event = {
        target: content.nativeElement,
        currentTarget: fixture.debugElement.query(By.css('.dialog-overlay')).nativeElement,
      };
      fixture.debugElement.query(By.css('.dialog-overlay')).triggerEventHandler('click', event);

      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Child Component Outputs', () => {
    it('should emit saveUser when app-register emits saveUser', () => {
      const formData = new FormData();
      const payload = { formData, isEdit: false };
      const emitSpy = jest.spyOn(component.saveUser, 'emit');

      const registerEl = fixture.debugElement.query(By.css('app-register'));
      expect(registerEl).toBeTruthy();

      registerEl.triggerEventHandler('saveUser', payload);

      expect(emitSpy).toHaveBeenCalledWith(payload);
    });

    it('should emit closeDialog when app-register emits formCancelled', () => {
      const closeSpy = jest.spyOn(component.closeDialog, 'emit');

      const registerEl = fixture.debugElement.query(By.css('app-register'));
      expect(registerEl).toBeTruthy();

      registerEl.triggerEventHandler('formCancelled');

      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
