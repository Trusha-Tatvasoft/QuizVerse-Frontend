import { Directive, Input, HostListener, ElementRef, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appTogglePassword]', // Directive selector to be used in templates
})
export class TogglePasswordDirective {
  @Input('appTogglePassword') targetInput!: HTMLInputElement; // Input target input element to toggle

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  private show = false; // Flag to track visibility state

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
