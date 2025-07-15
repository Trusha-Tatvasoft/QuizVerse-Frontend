import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilledButtonComponent } from './filled-button.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import '@testing-library/jest-dom';

describe('FilledButtonComponent', () => {
  let component: FilledButtonComponent;
  let fixture: ComponentFixture<FilledButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, FilledButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FilledButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Basic component initialization
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Label rendering
  it('should display label text', () => {
    component.config.label = 'Test Button';
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.flex div'));
    expect(label?.nativeElement.textContent).toContain('Test Button');
  });

  // Image rendering when matIcon is not provided
  it('should show image if matIcon is not provided but imageSrc is', () => {
    component.config.label = 'Image Test';
    component.config.matIcon = '';
    component.config.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('https://example.com/icon.png');
  });

  // Event emission when button is clicked and not disabled
  it('should emit event on click when not disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.config.isDisabled = false;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  // Event should not emit when button is disabled
  it('should not emit event when disabled', () => {
    const spy = jest.spyOn(component.buttonClicked, 'emit');
    component.config.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  // Render only icon if label is empty
  it('should render only icon when label is empty and matIcon is set', () => {
    component.config.label = '';
    component.config.matIcon = 'star';
    component.config.iconFontSet = 'material-icons';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('star');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  // Render only image if label is empty
  it('should render only image when label is empty and imageSrc is set', () => {
    component.config.label = '';
    component.config.matIcon = '';
    component.config.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('https://example.com/icon.png');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  // Check icon left position
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

  // Check icon right position
  it('should set icon to right when imagePosition is right', () => {
    component.config.label = 'Right Icon';
    component.config.imagePosition = 'right';
    component.config.matIcon = 'chevron_right';
    component.config.imageSrc = '';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    const iconIndex = Array.from(flexContainer.children).indexOf(icon.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(iconIndex).toBeGreaterThan(labelIndex);
  });

  // Check image left position
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

  // Check image right position
  it('should set image to right when imagePosition is right', () => {
    component.config.label = 'Right Image';
    component.config.imagePosition = 'right';
    component.config.matIcon = '';
    component.config.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    const imgIndex = Array.from(flexContainer.children).indexOf(img.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(imgIndex).toBeGreaterThan(labelIndex);
  });

  // Validate default and invalid font weight fallback
  it('should handle undefined or invalid fontWeight with default value', () => {
    component.config.fontWeight = undefined as any;
    expect(component.validFontWeight).toBe('400');
    component.config.fontWeight = -1;
    expect(component.validFontWeight).toBe('-1');
    component.config.fontWeight = 0;
    expect(component.validFontWeight).toBe('0');
  });

  // Check button type as submit
  it('should use correct button type for submit', () => {
    component.config.type = 'submit';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('submit');
  });

  // Check button type as reset
  it('should use correct button type for reset', () => {
    component.config.type = 'reset';
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['type']).toBe('reset');
  });

  // Ensure nothing renders when all display content is empty
  it('should not render content when label, imageSrc, and matIcon are empty', () => {
    component.config.label = '';
    component.config.imageSrc = '';
    component.config.matIcon = '';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
    expect(fixture.debugElement.query(By.css('img'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mat-icon'))).toBeNull();
  });

  // Check disabled button attribute
  it('should apply disabled attribute correctly', () => {
    component.config.isDisabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });
});
