import { Directive, Input, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTogglePassword]', // Directive selector to be used in templates
})
export class TogglePasswordDirective {
  @Input('appTogglePassword') targetInput!: HTMLInputElement; // Input target input element to toggle

  private show = false; // Flag to track visibility state

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
  ) {} // Inject ElementRef and Renderer2

  @HostListener('click')
  toggle(): void {
    this.show = !this.show; // Toggle password visibility
    const type = this.show ? 'text' : 'password';
    this.renderer.setAttribute(this.targetInput, 'type', type); // Set input type accordingly

    const icon = this.el.nativeElement.querySelector('mat-icon'); // Get icon inside the host element
    if (icon) {
      this.renderer.setProperty(icon, 'innerText', this.show ? 'visibility' : 'visibility_off'); // Toggle icon text
    }
  }
}
