import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManualQuestionTabComponent } from './manual-question-tab.component';
import { manualQuestionFormTabConfig } from '../../configs/question-pool-tab-config';
import { TabComponent } from '../../../../../shared/components/tab/tab.component';
import { CommonModule } from '@angular/common';

describe('ManualQuestionTabComponent', () => {
  let component: ManualQuestionTabComponent;
  let fixture: ComponentFixture<ManualQuestionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualQuestionTabComponent, TabComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ManualQuestionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs from config', () => {
    expect(component.tabs).toEqual(manualQuestionFormTabConfig);
  });

  it('should initialize selectedIndex to 0', () => {
    expect(component.selectedIndex()).toBe(0);
  });

  it('should switch to the provided tab index', () => {
    component.switchToTab(2);
    expect(component.selectedIndex()).toBe(2);
  });

  it('should update selectedIndex when switching multiple times', () => {
    component.switchToTab(1);
    expect(component.selectedIndex()).toBe(1);

    component.switchToTab(0);
    expect(component.selectedIndex()).toBe(0);
  });
});
