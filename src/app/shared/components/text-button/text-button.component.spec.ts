import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextButtonComponent } from './text-button.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import '@testing-library/jest-dom';
import { AppColors } from '../../../utils/constants';

describe('TextButtonComponent', () => {
  let component: TextButtonComponent;
  let fixture: ComponentFixture<TextButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, TextButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display label correctly', () => {
    component.label = 'Click Me';
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('.flex div'));
    expect(labelElement?.nativeElement.textContent).toContain('Click Me');
  });

  it('should display image when matIcon is not provided but imageSrc is', () => {
    component.matIcon = '';
    component.imageSrc = 'https://example.com/icon.png';
    component.label = 'Test';
    fixture.detectChanges();
    const image = fixture.debugElement.query(By.css('img'));
    expect(image).toBeTruthy();
    expect(image.nativeElement.src).toContain('https://example.com/icon.png');
  });

  it('should emit onClick when button is clicked and not disabled', () => {
    const spy = jest.spyOn(component.onClick, 'emit');
    component.disabled = false;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  it('should not emit onClick when disabled', () => {
    const spy = jest.spyOn(component.onClick, 'emit');
    component.disabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should use correct button type for submit', () => {
    component.type = 'submit';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('submit');
  });

  it('should use correct button type for reset', () => {
    component.type = 'reset';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('reset');
  });

  it('should handle undefined or invalid fontWeight with default value', () => {
    component.fontWeight = undefined as any;
    expect(component.validFontWeight).toBe('400');
    component.fontWeight = -1;
    expect(component.validFontWeight).toBe('-1');
    component.fontWeight = 0;
    expect(component.validFontWeight).toBe('0');
  });

  it('should render mat-icon on left when imagePosition is left', () => {
    component.matIcon = 'add';
    component.imagePosition = 'left';
    component.label = 'Test';
    component.imageSrc = '';
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

  it('should render image on left when imagePosition is left', () => {
    component.imageSrc = 'https://example.com/icon.png';
    component.imagePosition = 'left';
    component.label = 'Test';
    component.matIcon = '';
    fixture.detectChanges();
    const image = fixture.debugElement.query(By.css('img'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    expect(image).toBeTruthy();
    expect(label).toBeTruthy();
    const imageIndex = Array.from(flexContainer.children).indexOf(image.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(imageIndex).toBeLessThan(labelIndex);
  });

  it('should apply outline-button class and Tailwind styles', () => {
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement).toHaveClass('outline-button');
    expect(button.nativeElement).toHaveClass('bg-white');
    expect(button.nativeElement).toHaveClass('text-sm');
    expect(button.nativeElement).toHaveClass('font-medium');
    expect(button.nativeElement).toHaveClass('rounded-lg');
    expect(button.nativeElement).toHaveClass('px-5');
    expect(button.nativeElement).toHaveClass('py-2.5');
  });

  it('should set --outline-primary CSS variable in ngOnInit', () => {
    const mockColor = '#9333ea';
    (AppColors as any).globalSecondaryColor = mockColor;
    component.ngOnInit();
    expect(document.documentElement.style.getPropertyValue('--outline-primary')).toBe(mockColor);
  });

  it('should apply disabled attribute correctly', () => {
    component.disabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should apply correct image size and styles', () => {
    component.imageSrc = 'https://example.com/icon.png';
    component.label = 'Test';
    component.matIcon = '';
    fixture.detectChanges();
    const image = fixture.debugElement.query(By.css('img'));
    expect(image.nativeElement).toHaveClass('w-5');
    expect(image.nativeElement).toHaveClass('h-5');
    expect(image.nativeElement).toHaveClass('object-contain');
  });
});
