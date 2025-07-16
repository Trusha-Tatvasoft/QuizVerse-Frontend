import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set default percentage and color', () => {
    expect(component.percentage).toBe(50);
    expect(component.color).toBe('primary');
  });

  it('should return correct CSS variable for primary', () => {
    component.color = 'primary';
    expect(component.progressbarColor).toBe('var(--global-primary-color)');
  });

  it('should return correct CSS variable for secondary', () => {
    component.color = 'secondary';
    expect(component.progressbarColor).toBe('var(--global-secondary-color)');
  });

  it('should return correct CSS variable for black', () => {
    component.color = 'black';
    expect(component.progressbarColor).toBe('var(--black-color)');
  });

  it('should set CSS variables on ngOnInit', () => {
    component.percentage = 75;
    component.color = 'secondary';
    component.ngOnInit();
    const style = nativeElement.style;
    expect(style.getPropertyValue('--progress-bar-percentage')).toBe('75%');
    expect(style.getPropertyValue('--progress-bar-color')).toBe('var(--global-secondary-color)');
  });

  it('should apply the color class on inner div', () => {
    component.color = 'secondary';
    fixture.detectChanges();
    const fill = nativeElement.querySelector('.progress-bar-fill')!;
    expect(fill.classList.contains('secondary')).toBe(true);
  });

  it('should return fallback color for unknown color input', () => {
    component.color = 'unknown' as any;
    expect(component.progressbarColor).toBe('var(--global-primary-color)');
  });
});
