import { QuestionPoolListingComponent } from './question-pool-listing.component';
import type { TableData } from '../../../../../shared/interfaces/table-component.interface';

describe('QuestionPoolListingComponent', () => {
  let component: QuestionPoolListingComponent;

  beforeEach(() => {
    component = new QuestionPoolListingComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize inputs with default values', () => {
    expect(component.dataSource).toEqual([]);
    expect(component.totalItems).toBe(0);
  });

  describe('tableTitle getter', () => {
    it('returns totalItems count when totalItems is set', () => {
      component.totalItems = 100;
      component.dataSource = [{}, {}, {}] as TableData[];
      expect(component.tableTitle).toBe('Question Pool (100)');
    });

    it('returns dataSource length when totalItems is zero or falsy', () => {
      component.totalItems = 0;
      component.dataSource = [{}, {}, {}] as TableData[];
      expect(component.tableTitle).toBe('Question Pool (3)');
    });
  });

  it('should emit pageChange event on onPageChange()', () => {
    const spy = jest.spyOn(component.pageChange, 'emit');
    const pageEvent = { pageIndex: 1, pageSize: 10 };

    component.onPageChange(pageEvent);

    expect(spy).toHaveBeenCalledWith(pageEvent);
  });

  it('should emit sortChange event on onSortChange()', () => {
    const spy = jest.spyOn(component.sortChange, 'emit');
    const sortEvent = { active: 'queText', direction: 'asc' };

    component.onSortChange(sortEvent);

    expect(spy).toHaveBeenCalledWith(sortEvent);
  });

  it('should emit actionClick event on onActionClick()', () => {
    const spy = jest.spyOn(component.actionClick, 'emit');
    const actionEvent = { action: 'edit', row: {} as TableData };

    component.onActionClick(actionEvent);

    expect(spy).toHaveBeenCalledWith(actionEvent);
  });
});
