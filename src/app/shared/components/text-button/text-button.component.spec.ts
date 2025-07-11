import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextButtonComponent } from './text-button.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import '@testing-library/jest-dom';
import { ButtonConfig } from '../../interfaces/button-config.interface';
import { DEFAULT_BUTTON_CONFIG } from '../../interfaces/default-button-config.constants';

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

  it('should apply default config values from DEFAULT_BUTTON_CONFIG', () => {
    component.textButtonConfig = {};
    component.ngOnInit();
    expect(component.config).toEqual(DEFAULT_BUTTON_CONFIG);
  });

  it('should merge textButtonConfig with DEFAULT_BUTTON_CONFIG', () => {
    component.textButtonConfig = { label: 'Custom', type: 'submit' };
    component.ngOnInit();
    expect(component.config).toEqual({
      ...DEFAULT_BUTTON_CONFIG,
      label: 'Custom',
      type: 'submit',
    });
  });

  it('should display label correctly', () => {
    component.textButtonConfig = { label: 'Click Me' };
    component.ngOnInit();
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('.flex div'));
    expect(labelElement?.nativeElement.textContent).toContain('Click Me');
  });

  it('should display image when matIcon is not provided but imageSrc is', () => {
    component.textButtonConfig = {
      matIcon: '',
      imageSrc: 'https://example.com/icon.png',
      label: 'Test',
    };
    component.ngOnInit();
    fixture.detectChanges();
    const image = fixture.debugElement.query(By.css('img'));
    expect(image).toBeTruthy();
    expect(image.nativeElement.src).toContain('https://example.com/icon.png');
  });

  it('should prioritize mat-icon over imageSrc when both are provided', () => {
    component.textButtonConfig = {
      matIcon: 'home',
      imageSrc: 'https://example.com/icon.png',
      label: 'Test',
    };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    const image = fixture.debugElement.query(By.css('img'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('home');
    expect(image).toBeNull();
  });

  it('should emit onClick when button is clicked and not disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.textButtonConfig = { isDisabled: false };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  it('should not emit onClick when disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.textButtonConfig = { isDisabled: true };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render only icon when label is empty and matIcon is set', () => {
    component.textButtonConfig = { label: '', matIcon: 'star', iconFontSet: 'material-icons' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('star');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  it('should render only image when label is empty and imageSrc is set', () => {
    component.textButtonConfig = {
      label: '',
      matIcon: '',
      imageSrc: 'https://example.com/icon.png',
    };
    component.ngOnInit();
    fixture.detectChanges();
    const image = fixture.debugElement.query(By.css('img'));
    expect(image).toBeTruthy();
    expect(image.nativeElement.src).toContain('https://example.com/icon.png');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  it('should use correct button type for submit', () => {
    component.textButtonConfig = { type: 'submit' };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('submit');
  });

  it('should use correct button type for reset', () => {
    component.textButtonConfig = { type: 'reset' };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('reset');
  });

  it('should apply font weight correctly', () => {
    component.textButtonConfig = { fontWeight: 600, label: 'Test' };
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.validFontWeight).toBe('600');
    const label = fixture.debugElement.query(By.css('.flex div'));
    expect(label?.nativeElement.style.fontWeight).toBe('600');
  });

  it('should render mat-icon on right when imagePosition is right', () => {
    component.textButtonConfig = {
      matIcon: 'add',
      imagePosition: 'right',
      label: 'Test',
      imageSrc: '',
    };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    expect(icon).toBeTruthy();
    expect(label).toBeTruthy();
    const iconIndex = Array.from(flexContainer.children).indexOf(icon.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(iconIndex).toBeGreaterThan(labelIndex);
  });

  it('should render image on right when imagePosition is right', () => {
    component.textButtonConfig = {
      imageSrc: 'https://example.com/icon.png',
      imagePosition: 'right',
      label: 'Test',
      matIcon: '',
    };
    component.ngOnInit();
    fixture.detectChanges();
    const image = fixture.debugElement.query(By.css('img'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    expect(image).toBeTruthy();
    expect(label).toBeTruthy();
    const imageIndex = Array.from(flexContainer.children).indexOf(image.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(imageIndex).toBeGreaterThan(labelIndex);
  });

  it('should apply text-button class and Tailwind styles', () => {
    component.textButtonConfig = { label: 'Test' };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement).toHaveClass('text-button');
  });

  it('should apply correct icon size and styles', () => {
    component.textButtonConfig = { matIcon: 'home', label: 'Test' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon.nativeElement).toHaveClass('button-icon');
    expect(icon.nativeElement.classList).toContain('button-icon');
  });

  it('should not render content when label, imageSrc, and matIcon are empty', () => {
    component.textButtonConfig = { label: '', imageSrc: '', matIcon: '' };
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
    expect(fixture.debugElement.query(By.css('img'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mat-icon'))).toBeNull();
  });

  it('should treat whitespace-only label as empty', () => {
    component.textButtonConfig = { label: '   ', matIcon: 'star', iconFontSet: 'material-icons' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('star');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  it('should default fontWeight to 400 when not provided or invalid', () => {
    component.textButtonConfig = {};
    component.ngOnInit();
    expect(component.validFontWeight).toBe('500');
  });

  it('should set correct fontSet attribute on mat-icon', () => {
    component.textButtonConfig = {
      matIcon: 'star',
      iconFontSet: 'material-icons-outlined',
      label: 'Test',
    };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon.nativeElement.getAttribute('ng-reflect-font-set')).toBe('material-icons-outlined');
  });

  it('should add disabled attribute when isDisabled is true', () => {
    component.textButtonConfig = { isDisabled: true };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should use type from DEFAULT_BUTTON_CONFIG if not provided', () => {
    component.textButtonConfig = {};
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe(DEFAULT_BUTTON_CONFIG.type);
  });

  it('should fallback to icon if label is missing and matIcon is set', () => {
    component.textButtonConfig = { label: '', matIcon: 'home' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
  });
});
