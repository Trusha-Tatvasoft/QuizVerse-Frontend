import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { By } from '@angular/platform-browser';
import { ColumnDef, CurrencyValue } from '../../interfaces/table-component.interface';
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

  it('should emit sortChange with original sort if direction is not empty', () => {
    const spy = jest.spyOn(component.sortChange, 'emit');
    const sortEvent: Sort = { active: 'name', direction: 'asc' };

    component.onSortChange(sortEvent);

    expect(spy).toHaveBeenCalledWith({ active: 'name', direction: 'asc' });
  });

  it('should reset active and emit sortChange if direction is empty', () => {
    const spy = jest.spyOn(component.sortChange, 'emit');
    const sortEvent: Sort = { active: 'name', direction: '' };

    component.onSortChange(sortEvent);

    expect(spy).toHaveBeenCalledWith({ active: '', direction: '' });
  });

  it('should emit actionClick with action.icon on icon button click', () => {
    const spy = jest.spyOn(component.actionClick, 'emit');
    const row = { name: 'Alice' };
    const action = { icon: 'edit', tooltip: 'Edit User' };

    component.onActionClick(action, row);

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

  describe('getInitials', () => {
    it('should return empty string if name is empty', () => {
      expect(component.getInitials('')).toBe('');
      expect(component.getInitials(null as any)).toBe('');
    });

    it('should return first letter in uppercase if name has one word', () => {
      expect(component.getInitials('john')).toBe('J');
      expect(component.getInitials(' alice ')).toBe('A');
    });

    it('should return first letters of first two words in uppercase if name has more than one word', () => {
      expect(component.getInitials('john doe')).toBe('JD');
      expect(component.getInitials(' alice wonderland ')).toBe('AW');
      expect(component.getInitials('Mark Evan Smith')).toBe('ME'); // only first two words considered
    });
  });

  describe('getInitialsColorClass', () => {
    it('should return default class if name is empty', () => {
      expect(component.getInitialsColorClass('')).toBe('bg-avatar-0');
      expect(component.getInitialsColorClass(null as any)).toBe('bg-avatar-0');
    });

    it('should return a valid avatar class between 0 and 11 based on name hash', () => {
      const classRegex = /^bg-avatar-(\d+)$/;

      const result1 = component.getInitialsColorClass('John Doe');
      const result2 = component.getInitialsColorClass('Alice');
      const result3 = component.getInitialsColorClass('Bob Smith');

      [result1, result2, result3].forEach((result) => {
        expect(result).toMatch(classRegex);
        const index = parseInt(result.split('-')[2], 10);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(12);
      });
    });

    it('should return same class for same name', () => {
      const name = 'John Doe';
      const class1 = component.getInitialsColorClass(name);
      const class2 = component.getInitialsColorClass(name);
      expect(class1).toBe(class2);
    });

    it('should return different class for different names (likely)', () => {
      const class1 = component.getInitialsColorClass('Alice');
      const class2 = component.getInitialsColorClass('Bob');
      expect(class1).not.toBe(class2);
    });
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
});
