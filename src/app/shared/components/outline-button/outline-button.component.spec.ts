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

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display label text', () => {
    component.config.label = 'Test Outline Button';
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.flex div'));
    expect(label?.nativeElement.textContent).toContain('Test Outline Button');
  });

  it('should show image if matIcon is not provided but imageSrc is', () => {
    component.config.label = 'Image Test';
    component.config.matIcon = '';
    component.config.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('https://example.com/icon.png');
  });

  it('should emit event on click when not disabled', () => {
    const spy = jest.spyOn(component.onClick, 'emit');
    component.config.isDisabled = false;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  it('should not emit event when disabled', () => {
    const spy = jest.spyOn(component.onClick, 'emit');
    component.config.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should set icon to left when imagePosition is left', () => {
    component.config.label = 'Left Icon';
    component.config.imagePosition = 'left';
    component.config.matIcon = 'chevron_left';
    component.config.imageSrc = '';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    expect(icon).toBeTruthy();
    expect(label).toBeTruthy();
    const iconIndex = Array.from(flexContainer.children).indexOf(icon.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(iconIndex).toBeLessThan(labelIndex);
  });

  it('should set image to left when imagePosition is left', () => {
    component.config.label = 'Left Image';
    component.config.imagePosition = 'left';
    component.config.matIcon = '';
    component.config.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    expect(img).toBeTruthy();
    expect(label).toBeTruthy();
    const imgIndex = Array.from(flexContainer.children).indexOf(img.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(imgIndex).toBeLessThan(labelIndex);
  });

  it('should handle undefined or invalid fontWeight with default value', () => {
    component.config.fontWeight = undefined as any;
    expect(component.validFontWeight).toBe('400');
    component.config.fontWeight = -1;
    expect(component.validFontWeight).toBe('-1');
    component.config.fontWeight = 0;
    expect(component.validFontWeight).toBe('0');
  });

  it('should use correct button type for reset', () => {
    component.config.type = 'reset';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('reset');
  });

  it('should apply outline-button class and Tailwind styles', () => {
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement).toHaveClass('outline-button');
  });

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

  it('should set --outline-primary CSS variable to AppColors.globalPrimaryColor on init', () => {
    const mockColor = '#3f51b5';
    (AppColors as any).globalPrimaryColor = mockColor;
    component.ngOnInit();
    expect(document.documentElement.style.getPropertyValue('--outline-primary')).toBe(mockColor);
  });

  it('should apply disabled attribute correctly', () => {
    component.config.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });
});
