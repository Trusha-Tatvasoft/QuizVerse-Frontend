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
    expect(component.theme).toBe('primary');
  });

  it('should return correct CSS variable for primary', () => {
    component.theme = 'primary';
    expect(component.progressbarColor).toBe('var(--global-primary-color)');
  });

  it('should return correct CSS variable for secondary', () => {
    component.theme = 'secondary';
    expect(component.progressbarColor).toBe('var(--global-secondary-color)');
  });

  it('should set CSS variables on ngOnInit', () => {
    component.percentage = 75;
    component.theme = 'secondary';
    component.ngOnInit();
    const style = nativeElement.style;
    expect(style.getPropertyValue('--progress-bar-percentage')).toBe('75%');
    expect(style.getPropertyValue('--progress-bar-color')).toBe('var(--global-secondary-color)');
  });

  it('should return fallback color for unknown color input', () => {
    component.theme = 'unknown' as any;
    expect(component.progressbarColor).toBe('var(--global-primary-color)');
  });

  it('should clamp percentage > 100 to 100 via validPercentage', () => {
    component.percentage = 150;
    expect(component.validPercentage).toBe(100);
  });

  it('should clamp percentage < 0 to 0 via validPercentage', () => {
    component.percentage = -20;
    expect(component.validPercentage).toBe(0);
  });

  it('should return same percentage if between 0 and 100', () => {
    component.percentage = 42;
    expect(component.validPercentage).toBe(42);
  });
});
