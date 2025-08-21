import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryPreviewComponent } from './category-preview.component';
import { DatePipe } from '@angular/common';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

describe('CategoryPreviewComponent', () => {
  let component: CategoryPreviewComponent;
  let fixture: ComponentFixture<CategoryPreviewComponent>;

  const mockData = {
    categoryName: 'General Knowledge',
    description: 'Basic GK category',
    createdDate: '2025-08-18T10:00:00', // string from API
    isActive: true,
    quizCount: 5,
    icon: 'school',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule, CategoryPreviewComponent, TagComponent],
      providers: [DatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryPreviewComponent);
    component = fixture.componentInstance;
    component.data = mockData as any;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should format the createdDate correctly', () => {
    const formatted = new DatePipe('en-US').transform(new Date(mockData.createdDate), 'yyyy-MM-dd');
    expect(component.formatedDate).toBe(formatted);
  });

  it('should display category name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.category-info h3')?.textContent).toContain(
      mockData.categoryName,
    );
  });

  it('should show ActiveTag when category is active', () => {
    const tagDe = fixture.debugElement.query(By.directive(TagComponent));
    expect(tagDe).toBeTruthy();

    const tagInstance = tagDe.componentInstance as TagComponent;
    expect(tagInstance.tagConfig).toEqual(component.ActiveTagConfig);
  });

  it('should show InActiveTag when category is inactive', () => {
    component.data.isActive = false;
    fixture.detectChanges();

    const tagDe = fixture.debugElement.query(By.directive(TagComponent));
    expect(tagDe).toBeTruthy();

    const tagInstance = tagDe.componentInstance as TagComponent;
    expect(tagInstance.tagConfig).toEqual(component.InActiveTagConfig);
  });

  it('should display description and quiz count', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.category-description p:last-child')?.textContent).toContain(
      mockData.description,
    );
    expect(
      compiled.querySelector('.meta-grid div:first-child p:last-child')?.textContent,
    ).toContain(`${mockData.quizCount} quizzes`);
  });

  it('should emit close event when onClose is called', () => {
    const emitSpy = jest.spyOn(component.close, 'emit');
    component.onClose();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit close event when close button is clicked', () => {
    const emitSpy = jest.spyOn(component.close, 'emit'); // use jest.spyOn instead of spyOn
    const button = fixture.debugElement.query(By.css('.close-button'));
    button.triggerEventHandler('click', null);
    expect(emitSpy).toHaveBeenCalled();
  });
});
