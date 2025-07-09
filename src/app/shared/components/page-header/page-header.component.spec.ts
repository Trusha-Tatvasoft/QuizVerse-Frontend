import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title and subtitle', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.title');
    const subtitleEl = fixture.nativeElement.querySelector('.subtitle');

    expect(titleEl.textContent).toContain('Test Title');
    expect(subtitleEl.textContent).toContain('Test Subtitle');
  });

  it('should render the correct icon', () => {
    component.icon = 'shield';
    fixture.detectChanges();

    const iconEl = fixture.nativeElement.querySelector('mat-icon');
    expect(iconEl.textContent.trim()).toBe('shield');
  });

  it('should apply correct theme class based on input', () => {
    component.theme = 'admin';
    fixture.detectChanges();

    const cardEl = fixture.nativeElement.querySelector('mat-card');

    expect(cardEl.classList.contains('admin')).toBe(true);
  });
});
