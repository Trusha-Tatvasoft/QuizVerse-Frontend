import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiQuestionTabComponent } from './ai-question-tab.component';
import { TabComponent } from '../../../../../shared/components/tab/tab.component';
import { aiQuestionFormTabConfig } from '../../configs/question-pool-tab-config';
import { signal } from '@angular/core';

describe('AiQuestionTabComponent', () => {
  let component: AiQuestionTabComponent;
  let fixture: ComponentFixture<AiQuestionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabComponent, AiQuestionTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiQuestionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs with aiQuestionFormTabConfig', () => {
    expect(component.tabs).toEqual(aiQuestionFormTabConfig);
  });

  it('should initialize selectedIndex as signal with default 0', () => {
    expect(component.selectedIndex()).toBe(0);
  });

  it('should switch tab correctly using switchToTab()', () => {
    component.switchToTab(2);
    expect(component.selectedIndex()).toBe(2);
  });

  it('should update selectedIndex signal correctly on multiple changes', () => {
    component.switchToTab(1);
    expect(component.selectedIndex()).toBe(1);

    component.switchToTab(3);
    expect(component.selectedIndex()).toBe(3);
  });
});
