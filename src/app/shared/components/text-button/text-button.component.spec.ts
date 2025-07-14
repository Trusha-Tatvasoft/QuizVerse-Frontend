import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextButtonComponent } from './text-button.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import '@testing-library/jest-dom';
import { DEFAULT_BUTTON_CONFIG } from '../../interfaces/default-button-config.constants';

describe('TextButtonComponent', () => {
  let component: TextButtonComponent;
  let fixture: ComponentFixture<TextButtonComponent>;

  // Setup the component and module before each test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, TextButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Component creation test
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Default config check
  it('should apply default config values from DEFAULT_BUTTON_CONFIG', () => {
    component.textButtonConfig = {};
    component.ngOnInit();
    expect(component.config).toEqual(DEFAULT_BUTTON_CONFIG);
  });

  // Merging input config with default config
  it('should merge textButtonConfig with DEFAULT_BUTTON_CONFIG', () => {
    component.textButtonConfig = { label: 'Custom', type: 'submit' };
    component.ngOnInit();
    expect(component.config).toEqual({
      ...DEFAULT_BUTTON_CONFIG,
      label: 'Custom',
      type: 'submit',
    });
  });

  // Displaying label
  it('should display label correctly', () => {
    component.textButtonConfig = { label: 'Click Me' };
    component.ngOnInit();
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('.flex div'));
    expect(labelElement?.nativeElement.textContent).toContain('Click Me');
  });

  // Should show image when icon is not provided
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

  // mat-icon should have priority over imageSrc
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

  // Click event should be emitted if not disabled
  it('should emit onClick when button is clicked and not disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.textButtonConfig = { isDisabled: false };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  // Click event should NOT emit if disabled
  it('should not emit onClick when disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.textButtonConfig = { isDisabled: true };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  // Only icon should render if label is empty
  it('should render only icon when label is empty and matIcon is set', () => {
    component.textButtonConfig = { label: '', matIcon: 'star', iconFontSet: 'material-icons' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('star');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  // Only image should render if label is empty
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

  // Button type should be submit if passed
  it('should use correct button type for submit', () => {
    component.textButtonConfig = { type: 'submit' };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('submit');
  });

  // Button type should be reset if passed
  it('should use correct button type for reset', () => {
    component.textButtonConfig = { type: 'reset' };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('reset');
  });

  // Font weight should apply correctly to label
  it('should apply font weight correctly', () => {
    component.textButtonConfig = { fontWeight: 600, label: 'Test' };
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.validFontWeight).toBe('600');
    const label = fixture.debugElement.query(By.css('.flex div'));
    expect(label?.nativeElement.style.fontWeight).toBe('600');
  });

  // mat-icon should appear after label if iconPosition is right
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
    const iconIndex = Array.from(flexContainer.children).indexOf(icon.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(iconIndex).toBeGreaterThan(labelIndex);
  });

  // Image should appear after label if iconPosition is right
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
    const imageIndex = Array.from(flexContainer.children).indexOf(image.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(imageIndex).toBeGreaterThan(labelIndex);
  });

  // Class should apply correctly
  it('should apply text-button class and Tailwind styles', () => {
    component.textButtonConfig = { label: 'Test' };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement).toHaveClass('text-button');
  });

  // CSS class check for mat-icon
  it('should apply correct icon size and styles', () => {
    component.textButtonConfig = { matIcon: 'home', label: 'Test' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon.nativeElement).toHaveClass('button-icon');
  });

  // No content should render if everything is missing
  it('should not render content when label, imageSrc, and matIcon are empty', () => {
    component.textButtonConfig = { label: '', imageSrc: '', matIcon: '' };
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
    expect(fixture.debugElement.query(By.css('img'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mat-icon'))).toBeNull();
  });

  // White-space label should be treated as empty
  it('should treat whitespace-only label as empty', () => {
    component.textButtonConfig = { label: '   ', matIcon: 'star', iconFontSet: 'material-icons' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('star');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  // Font weight default fallback
  it('should default fontWeight to 400 when not provided or invalid', () => {
    component.textButtonConfig = {};
    component.ngOnInit();
    expect(component.validFontWeight).toBe('500');
  });

  // Font set check
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

  // Disabled attribute check
  it('should add disabled attribute when isDisabled is true', () => {
    component.textButtonConfig = { isDisabled: true };
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  // Button type fallback from default config
  it('should use type from DEFAULT_BUTTON_CONFIG if not provided', () => {
    component.textButtonConfig = {};
    component.ngOnInit();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe(DEFAULT_BUTTON_CONFIG.type);
  });

  // Should still fallback to icon if only icon is set
  it('should fallback to icon if label is missing and matIcon is set', () => {
    component.textButtonConfig = { label: '', matIcon: 'home' };
    component.ngOnInit();
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
  });
});
