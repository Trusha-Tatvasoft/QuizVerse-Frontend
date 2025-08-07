import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionPoolListingComponent } from './question-pool-listing.component';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import {
  questionPoolColumnsConfig,
  questionPoolMockData,
  questionPoolPaginationConfig,
} from '../../configs/question-pool-table.config';
import { CommonModule } from '@angular/common';

describe('QuestionPoolListingComponent', () => {
  let component: QuestionPoolListingComponent;
  let fixture: ComponentFixture<QuestionPoolListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TableComponent, QuestionPoolListingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionPoolListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct columns, paginationConfig, and dataSource', () => {
    expect(component.columns).toEqual(questionPoolColumnsConfig);
    expect(component.paginationConfig).toEqual(questionPoolPaginationConfig);
    expect(component.dataSource).toEqual(questionPoolMockData);
  });

  it('should compute totalItems correctly', () => {
    expect(component.totalItems).toBe(questionPoolMockData.length);
  });

  it('should compute tableTitle correctly', () => {
    const expectedTitle = `Question Pool (${questionPoolMockData.length})`;
    expect(component.tableTitle).toBe(expectedTitle);
  });

  it('should call onActionClick with correct parameters', () => {
    const spy = jest.spyOn(component, 'onActionClick');
    const mockEvent = { action: 'edit', row: questionPoolMockData[0] };
    component.onActionClick(mockEvent);
    expect(spy).toHaveBeenCalledWith(mockEvent);
  });

  it('should call onPageChange with correct parameters', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    const mockEvent = { pageIndex: 1, pageSize: 10 };
    component.onPageChange(mockEvent);
    expect(spy).toHaveBeenCalledWith(mockEvent);
  });

  it('should call onSortChange with correct parameters', () => {
    const spy = jest.spyOn(component, 'onSortChange');
    const mockEvent = { active: 'title', direction: 'asc' };
    component.onSortChange(mockEvent);
    expect(spy).toHaveBeenCalledWith(mockEvent);
  });
});
