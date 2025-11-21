import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlaggedCommentsTableComponent } from './flagged-comments-table.component';
import { TableComponent } from '../../../../../../shared/components/table/table.component';
import { TableData } from '../../../../../../shared/interfaces/table-component.interface';
import {
  flaggedCommentsTableColumnsConfig,
  flaggedCommentsTablePaginationConfig,
} from '../../../configs/flagged-comments-table.config';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FlaggedCommentsTableComponent', () => {
  let component: FlaggedCommentsTableComponent;
  let fixture: ComponentFixture<FlaggedCommentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlaggedCommentsTableComponent],
      schemas: [NO_ERRORS_SCHEMA], // Ignore child component template errors
    }).compileComponents();

    fixture = TestBed.createComponent(FlaggedCommentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty dataSource', () => {
      expect(component.dataSource).toEqual([]);
    });

    it('should initialize with totalItems as 0', () => {
      expect(component.totalItems).toBe(0);
    });

    it('should have correct columns configuration', () => {
      expect(component.columns).toEqual(flaggedCommentsTableColumnsConfig);
      expect(component.columns.length).toBe(7);
    });

    it('should have correct pagination configuration', () => {
      expect(component.paginationConfig).toEqual(flaggedCommentsTablePaginationConfig);
    });
  });

  describe('Input Properties', () => {
    it('should accept dataSource input', () => {
      const mockData: TableData[] = [
        {
          comment: 'Test comment',
          author: 'John Doe',
          quizName: 'Quiz 1',
          reason: 'Spam',
          date: '2024-01-01',
          status: 'pending',
        },
      ];
      component.dataSource = mockData;
      expect(component.dataSource).toEqual(mockData);
    });

    it('should accept totalItems input', () => {
      component.totalItems = 100;
      expect(component.totalItems).toBe(100);
    });

    it('should handle empty dataSource', () => {
      component.dataSource = [];
      expect(component.dataSource).toEqual([]);
      expect(component.dataSource.length).toBe(0);
    });

    it('should handle large dataSource', () => {
      const mockData: TableData[] = Array.from({ length: 100 }, (_, i) => ({
        comment: `Comment ${i}`,
        author: `Author ${i}`,
        quizName: `Quiz ${i}`,
        reason: 'Test',
        date: '2024-01-01',
        status: 'pending',
      }));
      component.dataSource = mockData;
      expect(component.dataSource.length).toBe(100);
    });
  });

  describe('Output Events', () => {
    it('should have pageChange output emitter', () => {
      expect(component.pageChange).toBeDefined();
    });

    it('should have sortChange output emitter', () => {
      expect(component.sortChange).toBeDefined();
    });

    it('should have actionClick output emitter', () => {
      expect(component.actionClick).toBeDefined();
    });
  });

  describe('onActionClick', () => {
    it('should emit actionClick event with correct data', () => {
      const mockRow: TableData = {
        comment: 'Test comment',
        author: 'John Doe',
        quizName: 'Quiz 1',
        reason: 'Spam',
        date: '2024-01-01',
        status: 'pending',
      };
      const mockEvent = { action: 'edit', row: mockRow };

      jest.spyOn(component.actionClick, 'emit');
      component.onActionClick(mockEvent);

      expect(component.actionClick.emit).toHaveBeenCalledWith(mockEvent);
      expect(component.actionClick.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit actionClick with delete action', () => {
      const mockRow: TableData = {
        comment: 'Test comment',
        author: 'Jane Doe',
      };
      const mockEvent = { action: 'delete', row: mockRow };

      jest.spyOn(component.actionClick, 'emit');
      component.onActionClick(mockEvent);

      expect(component.actionClick.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit actionClick with block action', () => {
      const mockRow: TableData = {
        comment: 'Inappropriate comment',
        author: 'Bad User',
      };
      const mockEvent = { action: 'block', row: mockRow };

      jest.spyOn(component.actionClick, 'emit');
      component.onActionClick(mockEvent);

      expect(component.actionClick.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('onPageChange', () => {
    it('should emit pageChange event with correct data', () => {
      const mockEvent = { pageIndex: 2, pageSize: 10 };

      jest.spyOn(component.pageChange, 'emit');
      component.onPageChange(mockEvent);

      expect(component.pageChange.emit).toHaveBeenCalledWith(mockEvent);
      expect(component.pageChange.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit pageChange with pageIndex 0', () => {
      const mockEvent = { pageIndex: 0, pageSize: 10 };

      jest.spyOn(component.pageChange, 'emit');
      component.onPageChange(mockEvent);

      expect(component.pageChange.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit pageChange with different pageSize', () => {
      const mockEvent = { pageIndex: 1, pageSize: 25 };

      jest.spyOn(component.pageChange, 'emit');
      component.onPageChange(mockEvent);

      expect(component.pageChange.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit pageChange with large pageIndex', () => {
      const mockEvent = { pageIndex: 99, pageSize: 10 };

      jest.spyOn(component.pageChange, 'emit');
      component.onPageChange(mockEvent);

      expect(component.pageChange.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('onSortChange', () => {
    it('should emit sortChange event with correct data', () => {
      const mockEvent = { active: 'comment', direction: 'asc' };

      jest.spyOn(component.sortChange, 'emit');
      component.onSortChange(mockEvent);

      expect(component.sortChange.emit).toHaveBeenCalledWith(mockEvent);
      expect(component.sortChange.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit sortChange with descending direction', () => {
      const mockEvent = { active: 'date', direction: 'desc' };

      jest.spyOn(component.sortChange, 'emit');
      component.onSortChange(mockEvent);

      expect(component.sortChange.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit sortChange for author column', () => {
      const mockEvent = { active: 'author', direction: 'asc' };

      jest.spyOn(component.sortChange, 'emit');
      component.onSortChange(mockEvent);

      expect(component.sortChange.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit sortChange for status column', () => {
      const mockEvent = { active: 'status', direction: 'desc' };

      jest.spyOn(component.sortChange, 'emit');
      component.onSortChange(mockEvent);

      expect(component.sortChange.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit sortChange with empty direction', () => {
      const mockEvent = { active: 'comment', direction: '' };

      jest.spyOn(component.sortChange, 'emit');
      component.onSortChange(mockEvent);

      expect(component.sortChange.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Column Configuration', () => {
    it('should have comment column configured correctly', () => {
      const commentColumn = component.columns.find((col) => col.key === 'comment');
      expect(commentColumn).toBeDefined();
      expect(commentColumn?.label).toBe('Comments');
      expect(commentColumn?.type).toBe('text');
      expect(commentColumn?.isSortable).toBe(true);
    });

    it('should have author column configured correctly', () => {
      const authorColumn = component.columns.find((col) => col.key === 'author');
      expect(authorColumn).toBeDefined();
      expect(authorColumn?.label).toBe('Author');
      expect(authorColumn?.type).toBe('text');
      expect(authorColumn?.isSortable).toBe(true);
    });

    it('should have status column configured as tag type', () => {
      const statusColumn = component.columns.find((col) => col.key === 'status');
      expect(statusColumn).toBeDefined();
      expect(statusColumn?.type).toBe('tag');
      expect(statusColumn?.isSortable).toBe(true);
    });

    it('should have actions column configured correctly', () => {
      const actionsColumn = component.columns.find((col) => col.key === 'actions');
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.label).toBe('Actions');
      expect(actionsColumn?.type).toBe('button');
      expect(actionsColumn?.isSortable).toBe(false);
    });

    it('should have all expected columns', () => {
      const expectedKeys = ['comment', 'author', 'quizName', 'reason', 'date', 'status', 'actions'];
      const actualKeys = component.columns.map((col) => col.key);
      expect(actualKeys).toEqual(expectedKeys);
    });
  });

  describe('Pagination Configuration', () => {
    it('should have applyPaginator set to true', () => {
      expect(component.paginationConfig.applyPaginator).toBe(true);
    });

    it('should have pageSize defined', () => {
      expect(component.paginationConfig.pageSize).toBeDefined();
      expect(typeof component.paginationConfig.pageSize).toBe('number');
    });

    it('should have pageSizeOptions defined', () => {
      expect(component.paginationConfig.pageSizeOptions).toBeDefined();
      expect(Array.isArray(component.paginationConfig.pageSizeOptions)).toBe(true);
    });
  });

  describe('Event Emission Integration', () => {
    it('should emit all three event types independently', () => {
      jest.spyOn(component.actionClick, 'emit');
      jest.spyOn(component.pageChange, 'emit');
      jest.spyOn(component.sortChange, 'emit');

      component.onActionClick({ action: 'edit', row: {} });
      component.onPageChange({ pageIndex: 1, pageSize: 10 });
      component.onSortChange({ active: 'comment', direction: 'asc' });

      expect(component.actionClick.emit).toHaveBeenCalledTimes(1);
      expect(component.pageChange.emit).toHaveBeenCalledTimes(1);
      expect(component.sortChange.emit).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple action clicks', () => {
      jest.spyOn(component.actionClick, 'emit');

      component.onActionClick({ action: 'edit', row: {} });
      component.onActionClick({ action: 'delete', row: {} });
      component.onActionClick({ action: 'block', row: {} });

      expect(component.actionClick.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple page changes', () => {
      jest.spyOn(component.pageChange, 'emit');

      component.onPageChange({ pageIndex: 0, pageSize: 10 });
      component.onPageChange({ pageIndex: 1, pageSize: 10 });
      component.onPageChange({ pageIndex: 2, pageSize: 25 });

      expect(component.pageChange.emit).toHaveBeenCalledTimes(3);
    });
  });
});
