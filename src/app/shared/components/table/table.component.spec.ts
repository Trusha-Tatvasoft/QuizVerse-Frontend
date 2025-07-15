import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { By } from '@angular/platform-browser';
import {
  ColumnDef,
  TableData,
  ActionIcon,
  CurrencyValue,
} from '../../interfaces/table-component.interface';
import { SimpleChange } from '@angular/core';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, MatPaginatorModule, MatSortModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set displayedColumns including actions when actionIcons are present', () => {
    component.columns = [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
    ];
    component.actionIcons = [{ icon: 'edit', action: 'edit' }];
    component.ngOnInit();

    expect(component.displayedColumns).toContain('name');
    expect(component.displayedColumns).toContain('email');
    expect(component.displayedColumns).toContain('actions');
  });

  it('should handle page change and emit output', () => {
    const spy = jest.spyOn(component.pageChange, 'emit');
    const pageEvent: PageEvent = { pageIndex: 1, pageSize: 20, length: 100 };

    component.onPageChange(pageEvent);

    expect(spy).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 20 });
  });

  it('should emit sortChange when onSortChange is called', () => {
    const spy = jest.spyOn(component.sortChange, 'emit');
    const sortEvent: Sort = { active: 'name', direction: 'asc' };

    component.onSortChange(sortEvent);

    expect(spy).toHaveBeenCalledWith({ active: 'name', direction: 'asc' });
  });

  it('should emit actionClick on icon button click', () => {
    const spy = jest.spyOn(component.actionClick, 'emit');
    const row = { name: 'Alice' };

    component.onActionClick('edit', row);

    expect(spy).toHaveBeenCalledWith({ action: 'edit', row });
  });

  it('should return currency amount from object or number', () => {
    const value1: CurrencyValue = { amount: 120 };
    const value2 = 200;

    expect(component.getAmount(value1)).toBe(120);
    expect(component.getAmount(value2)).toBe(200);
    expect(component.getAmount(null)).toBeNull();
  });

  it('should return currency code from pipeArgs or fallback', () => {
    const value: CurrencyValue = { amount: 100, currencyCode: 'INR' };

    const column: ColumnDef = {
      key: 'amount',
      label: 'Amount',
      type: 'text',
      pipeArgs: ['EUR'],
    };

    expect(component.getCurrencyCodeFinal(value, column)).toBe('EUR');

    const fallbackColumn: ColumnDef = {
      key: 'amount',
      label: 'Amount',
      type: 'text',
    };

    expect(
      component.getCurrencyCodeFinal({ amount: 50, currencyCode: 'INR' }, fallbackColumn),
    ).toBe('INR');
    expect(component.getCurrencyCodeFinal(100, fallbackColumn)).toBe('USD');
  });

  it('should return currency display and digits from pipeArgs or default', () => {
    const column1: ColumnDef = {
      key: 'price',
      label: 'Price',
      type: 'text',
      pipeArgs: ['USD', 'code', '1.0-1'],
    };
    const column2: ColumnDef = {
      key: 'price',
      label: 'Price',
      type: 'text',
      pipeArgs: undefined,
    };

    expect(component.getCurrencyDisplay(column1)).toBe('code');
    expect(component.getCurrencyDigits(column1)).toBe('1.0-1');

    expect(component.getCurrencyDisplay(column2)).toBe('symbol');
    expect(component.getCurrencyDigits(column2)).toBe('1.2-2');
  });

  it('should hide paginator if totalItems <= pageSize', () => {
    component.totalItems = 5;
    component.pageSize = 10;
    component.dataSource = [{ id: 1 }];

    component.ngOnChanges({
      dataSource: {
        currentValue: component.dataSource,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.showPaginator).toBe(false);
  });

  it('should show paginator if totalItems > pageSize', () => {
    component.totalItems = 100;
    component.pageSize = 10;
    component.dataSource = [{ id: 1 }];

    component.ngOnChanges({
      dataSource: {
        currentValue: component.dataSource,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.showPaginator).toBe(true);
  });

  it('should mark columns without isSortable as false by default', () => {
    component.columns = [{ key: 'id', label: 'ID', type: 'text' }];
    component.setDisplayedColumns();

    expect(component.columns[0].isSortable).toBe(false);
  });

  it('should render no-data row when dataSource is empty', () => {
    component.columns = [{ key: 'name', label: 'Name', type: 'text' }];
    component.dataSource = [];
    component.ngOnInit();
    fixture.detectChanges();

    const noDataRow = fixture.debugElement.query(By.css('.no-data-message'));
    expect(noDataRow).toBeTruthy();
    expect(noDataRow.nativeElement.textContent.trim()).toBe('No data available.');
  });

  it('should call setDisplayedColumns when columns change', () => {
    component.columns = [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
    ];
    component.actionIcons = [];

    const changes = {
      columns: new SimpleChange(null, component.columns, true),
    };

    const spy = jest.spyOn<TableComponent, 'setDisplayedColumns'>(component, 'setDisplayedColumns');
    component.ngOnChanges(changes);

    expect(spy).toHaveBeenCalled();
  });

  it('should call setDisplayedColumns when dataSource changes', () => {
    component.dataSource = [{ name: 'John' }];

    const changes = {
      dataSource: new SimpleChange(null, component.dataSource, true),
    };

    const spy = jest.spyOn<TableComponent, 'setDisplayedColumns'>(component, 'setDisplayedColumns');
    component.ngOnChanges(changes);

    expect(spy).toHaveBeenCalled();
  });

  it('should call setDisplayedColumns when actionIcons change', () => {
    component.actionIcons = [{ icon: 'edit', action: 'edit' }];

    const changes = {
      actionIcons: new SimpleChange(null, component.actionIcons, true),
    };

    const spy = jest.spyOn<TableComponent, 'setDisplayedColumns'>(component, 'setDisplayedColumns');
    component.ngOnChanges(changes);

    expect(spy).toHaveBeenCalled();
  });
});
