import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilledButtonComponent } from './filled-button.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import '@testing-library/jest-dom';
import { AppColors } from '../../../utils/constants';

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

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display label text', () => {
    component.label = 'Test Button';
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.flex div'));
    expect(label?.nativeElement.textContent).toContain('Test Button');
  });

  it('should show image if matIcon is not provided but imageSrc is', () => {
    component.label = 'Image Test';
    component.matIcon = '';
    component.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('https://example.com/icon.png');
  });

  it('should emit event on click when not disabled', () => {
    const spy = jest.spyOn(component.onClick, 'emit');
    component.disabled = false;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  it('should not emit event when disabled', () => {
    const spy = jest.spyOn(component.onClick, 'emit');
    component.disabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render only icon when label is empty and matIcon is set', () => {
    component.label = '';
    component.matIcon = 'star';
    component.iconFontSet = 'material-icons';
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('star');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  it('should render only image when label is empty and imageSrc is set', () => {
    component.label = '';
    component.matIcon = '';
    component.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('https://example.com/icon.png');
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
  });

  it('should set icon to left when imagePosition is left', () => {
    component.label = 'Left Icon';
    component.imagePosition = 'left';
    component.matIcon = 'chevron_left';
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

  it('should set icon to right when imagePosition is right', () => {
    component.label = 'Right Icon';
    component.imagePosition = 'right';
    component.matIcon = 'chevron_right';
    component.imageSrc = '';
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

  it('should set image to left when imagePosition is left', () => {
    component.label = 'Left Image';
    component.imagePosition = 'left';
    component.matIcon = '';
    component.imageSrc = 'https://example.com/icon.png';
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

  it('should set image to right when imagePosition is right', () => {
    component.label = 'Right Image';
    component.imagePosition = 'right';
    component.matIcon = '';
    component.imageSrc = 'https://example.com/icon.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    const label = fixture.debugElement.query(By.css('.flex div'));
    const flexContainer = fixture.debugElement.query(By.css('.flex')).nativeElement;
    expect(img).toBeTruthy();
    expect(label).toBeTruthy();
    const imgIndex = Array.from(flexContainer.children).indexOf(img.nativeElement);
    const labelIndex = Array.from(flexContainer.children).indexOf(label.nativeElement);
    expect(imgIndex).toBeGreaterThan(labelIndex);
  });

  it('should apply font weight correctly', () => {
    component.fontWeight = 600;
    fixture.detectChanges();
    expect(component.validFontWeight).toBe('600');
    const label = fixture.debugElement.query(By.css('.flex div'));
    expect(label?.nativeElement.style.fontWeight).toBe('600');
  });

  it('should handle undefined or invalid fontWeight with default value', () => {
    component.fontWeight = undefined as any;
    expect(component.validFontWeight).toBe('400');
    component.fontWeight = -1;
    expect(component.validFontWeight).toBe('-1');
    component.fontWeight = 0;
    expect(component.validFontWeight).toBe('0');
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

  it('should not render content when label, imageSrc, and matIcon are empty', () => {
    component.label = '';
    component.imageSrc = '';
    component.matIcon = '';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.flex div'))).toBeNull();
    expect(fixture.debugElement.query(By.css('img'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mat-icon'))).toBeNull();
  });

  it('should apply disabled attribute correctly', () => {
    component.disabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });
});
