import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutlineButtonComponent } from './outline-button.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import '@testing-library/jest-dom';
import { AppColors } from '../../../utils/constants';

describe('OutlineButtonComponent', () => {
  let component: OutlineButtonComponent;
  let fixture: ComponentFixture<OutlineButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, OutlineButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OutlineButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Basic test to ensure the component instance is created
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Should render the given label text
  it('should display label text', () => {
    component.config.label = 'Test Outline Button';
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.flex div'));
    expect(label?.nativeElement.textContent).toContain('Test Outline Button');
  });

  // Should show image if matIcon is empty and imageSrc is defined
  it('should show image if matIcon is not provided but imageSrc is', () => {
    component.config.label = 'Image Test';
    component.config.matIcon = '';
    component.config.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('https://example.com/icon.png');
  });

  // Should emit the event if not disabled
  it('should emit event on click when not disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.config.isDisabled = false;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  // Should not emit event if disabled
  it('should not emit event when disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.config.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  // Icon should appear before label when position is left
  it('should set icon to left when imagePosition is left', () => {
    component.config.label = 'Left Icon';
    component.config.imagePosition = 'left';
    component.config.matIcon = 'chevron_left';
    component.config.imageSrc = '';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    const iconIndex = Array.from(flexContainer.children).indexOf(icon.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(iconIndex).toBeLessThan(labelIndex);
  });

  // Image should appear before label when position is left
  it('should set image to left when imagePosition is left', () => {
    component.config.label = 'Left Image';
    component.config.imagePosition = 'left';
    component.config.matIcon = '';
    component.config.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    const imgIndex = Array.from(flexContainer.children).indexOf(img.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(imgIndex).toBeLessThan(labelIndex);
  });

  // Should fallback to default font weight when fontWeight is undefined/invalid
  it('should handle undefined or invalid fontWeight with default value', () => {
    component.config.fontWeight = undefined as any;
    expect(component.validFontWeight).toBe('400');

    component.config.fontWeight = -1;
    expect(component.validFontWeight).toBe('-1');

    component.config.fontWeight = 0;
    expect(component.validFontWeight).toBe('0');
  });

  // Should apply the type attribute correctly when type is 'reset'
  it('should use correct button type for reset', () => {
    component.config.type = 'reset';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('reset');
  });

  // Should apply outline-button class
  it('should apply outline-button class and Tailwind styles', () => {
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement).toHaveClass('outline-button');
  });

  // Should apply correct image styling when imageSrc is set
  it('should apply correct image size and styles', () => {
    component.config.imageSrc = 'https://example.com/icon.png';
    component.config.label = 'Test';
    component.config.matIcon = '';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img.nativeElement).toHaveClass('w-5');
    expect(img.nativeElement).toHaveClass('h-5');
    expect(img.nativeElement).toHaveClass('object-contain');
  });

  // Should reflect disabled attribute on the DOM
  it('should apply disabled attribute correctly', () => {
    component.config.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });
});
