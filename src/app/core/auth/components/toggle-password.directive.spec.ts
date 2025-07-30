import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { TogglePasswordDirective } from './toggle-password.directive';

@Component({
  standalone: true,
  imports: [MatIconModule, TogglePasswordDirective],
  template: `
    <button [appTogglePassword]="passwordInput">
      <input #passwordInput type="password" />
      <mat-icon>{{ iconText }}</mat-icon>
    </button>
  `,
})
class TestHostComponent {
  iconText = 'visibility_off';
}

describe('TogglePasswordDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let button: DebugElement;
  let input: HTMLInputElement;
  let icon: HTMLElement;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    button = fixture.debugElement.query(By.css('button'));
    input = fixture.nativeElement.querySelector('input');
    icon = fixture.nativeElement.querySelector('mat-icon');
    fixture.detectChanges();
  });

  it('should toggle password visibility on click', async () => {
    expect(input.type).toBe('password');

    // First click
    button.triggerEventHandler('click');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.type).toBe('text');

    // Second click
    button.triggerEventHandler('click');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.type).toBe('password');
  });
});
