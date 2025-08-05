import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { TogglePasswordDirective } from './toggle-password.directive';

@Component({
  standalone: true,
  imports: [MatIconModule, TogglePasswordDirective],
  template: `
    <mat-icon [appTogglePassword]="passwordInput">visibility_off</mat-icon>
    <input #passwordInput type="password" />
  `,
})
class HostWithMatIconComponent {}

@Component({
  standalone: true,
  imports: [TogglePasswordDirective],
  template: `
    <div [appTogglePassword]="passwordInput">Toggle</div>
    <input #passwordInput type="password" />
  `,
})
class HostWithNonIconComponent {}

@Component({
  standalone: true,
  imports: [TogglePasswordDirective, MatIconModule],
  template: ` <mat-icon appTogglePassword>visibility_off</mat-icon> `,
})
class HostWithoutInputComponent {}

describe('TogglePasswordDirective', () => {
  describe('when host is <mat-icon>', () => {
    let fixture: ComponentFixture<HostWithMatIconComponent>;
    let input: HTMLInputElement;
    let icon: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostWithMatIconComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostWithMatIconComponent);
      fixture.detectChanges();

      input = fixture.nativeElement.querySelector('input');
      icon = fixture.nativeElement.querySelector('mat-icon');
    });

    it('should toggle password visibility and update icon text', () => {
      expect(input.type).toBe('password');
      expect(icon.textContent?.trim()).toBe('visibility_off');

      icon.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');
      expect(icon.textContent?.trim()).toBe('visibility');

      icon.click();
      fixture.detectChanges();
      expect(input.type).toBe('password');
      expect(icon.textContent?.trim()).toBe('visibility_off');
    });
  });

  describe('when host is NOT a <mat-icon>', () => {
    let fixture: ComponentFixture<HostWithNonIconComponent>;
    let input: HTMLInputElement;
    let div: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostWithNonIconComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostWithNonIconComponent);
      fixture.detectChanges();

      input = fixture.nativeElement.querySelector('input');
      div = fixture.nativeElement.querySelector('div');
    });

    it('should toggle password type but not crash on icon logic', () => {
      expect(input.type).toBe('password');

      div.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');

      div.click();
      fixture.detectChanges();
      expect(input.type).toBe('password');
    });
  });

  describe('when input is not provided', () => {
    let fixture: ComponentFixture<HostWithoutInputComponent>;
    let icon: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostWithoutInputComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostWithoutInputComponent);
      fixture.detectChanges();

      icon = fixture.nativeElement.querySelector('mat-icon');
    });

    it('should not throw error when targetInput is undefined', () => {
      expect(() => {
        icon.click();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});
