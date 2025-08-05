import { Directive, Input, HostListener, ElementRef, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appTogglePassword]',
})
export class TogglePasswordDirective {
  @Input('appTogglePassword') targetInput!: HTMLInputElement;

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  private show = false;

  @HostListener('click')
  toggle(): void {
    if (!this.targetInput) return;

    this.show = !this.show;
    const type = this.show ? 'text' : 'password';
    this.renderer.setAttribute(this.targetInput, 'type', type);

    // Update icon text if it is <mat-icon>
    const iconEl = this.el.nativeElement;
    if (iconEl.tagName === 'MAT-ICON') {
      this.renderer.setProperty(iconEl, 'textContent', this.show ? 'visibility' : 'visibility_off');
    }
  }
}
