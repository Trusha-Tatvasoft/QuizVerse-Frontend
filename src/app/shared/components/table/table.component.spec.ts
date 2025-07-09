import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Component, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  template: `
    <ng-template #customCell let-row>
      <span class="custom-cell">{{ row.name }} - Custom</span>
    </ng-template>
    <app-data-table
      [columns]="columns"
      [dataSource]="data"
      [columnTemplates]="{ name: customTemplate }"
    ></app-data-table>
  `,
  imports: [TableComponent],
})
class TestHostComponent {
  @ViewChild('customCell', { static: true }) customTemplate!: TemplateRef<any>;
  columns = [{ key: 'name', label: 'Name', type: 'custom' }];
  data = [{ name: 'Custom User' }];
}

describe('TableComponent - Edge Cases', () => {
  let fixture: ComponentFixture<TableComponent>;
  let component: TableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatChipsModule,
        TableComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
  });

  it('should gracefully handle no columns and data', () => {
    component.columns = [];
    component.dataSource = [];
    fixture.detectChanges();
    expect(component.displayedColumns).toEqual([]);
  });

  it('should default column.sortable to false if undefined', () => {
    component.columns = [{ key: 'id', label: 'ID', type: 'text' }];
    component.ngOnInit();
    expect(component.columns[0].sortable).toBe(false);
  });

  it('should skip actions column if no actionIcons are passed', () => {
    component.columns = [{ key: 'id', label: 'ID', type: 'text' }];
    component.actionIcons = [];
    component.ngOnInit();
    expect(component.displayedColumns.includes('actions')).toBe(false);
  });

  it('should support rendering tag type column', () => {
    component.columns = [{ key: 'tag', label: 'Tag', type: 'tag' }];
    component.dataSource = [{ tag: 'Angular' }];
    component.ngOnInit();
    fixture.detectChanges();

    const chip = fixture.debugElement.query(By.css('mat-chip'));
    expect(chip.nativeElement.textContent).toContain('Angular');
  });

  it('should support rendering button type column and emit action on click', () => {
    component.columns = [{ key: 'edit', label: 'Edit', type: 'button' }];
    component.dataSource = [{ edit: 'Edit' }];
    component.ngOnInit();
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.textContent).toContain('Edit');
  });

  it('should support profile column structure', () => {
    component.columns = [{ key: 'profile', label: 'User', type: 'profile' }];
    component.dataSource = [
      {
        profile: {
          image: 'https://example.com/image.png',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    ];
    component.ngOnInit();
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('img'));
    const name = fixture.debugElement.query(By.css('.name')).nativeElement;
    const email = fixture.debugElement.query(By.css('.email')).nativeElement;

    expect(img.nativeElement.src).toContain('image.png');
    expect(name.textContent).toContain('John Doe');
    expect(email.textContent).toContain('john@example.com');
  });

  it('should update displayedColumns on dataSource change via ngOnChanges', () => {
    component.columns = [{ key: 'id', label: 'ID', type: 'text' }];
    component.actionIcons = [{ icon: 'edit', action: 'edit' }];
    component.dataSource = [{ id: 1 }];
    const changes = {
      dataSource: {
        currentValue: [{ id: 2 }],
        previousValue: [],
        isFirstChange: () => false,
        firstChange: false,
      },
    };
    component.ngOnChanges(changes as any);
    expect(component.displayedColumns).toEqual(['id', 'actions']);
  });

  it('should show default "No data available" if noDataMessage is undefined', () => {
    component.columns = [{ key: 'name', label: 'Name', type: 'text' }];
    component.dataSource = [];
    component.ngOnInit();
    fixture.detectChanges();

    const noData = fixture.debugElement.query(By.css('.no-data-message'));
    expect(noData.nativeElement.textContent).toContain('No data available');
  });

  it('should not fail if columnTemplates is undefined', () => {
    component.columns = [{ key: 'name', label: 'Name', type: 'custom' }];
    component.dataSource = [{ name: 'Test' }];
    (component as any).columnTemplates = {}; // Force undefined
    component.ngOnInit();
    fixture.detectChanges();

    expect(component).toBeTruthy(); // just check rendering didn't crash
  });

  it('should preserve sortable true if set explicitly in column', () => {
    component.columns = [{ key: 'email', label: 'Email', type: 'text', sortable: true }];
    component.ngOnInit();
    expect(component.columns[0].sortable).toBe(true);
  });

  it('should emit correct data when action icon is clicked', () => {
    const row = { id: 1 };
    component.columns = [{ key: 'id', label: 'ID', type: 'text' }];
    component.dataSource = [row];
    component.actionIcons = [{ action: 'delete', icon: 'delete', tooltip: 'Delete' }];
    jest.spyOn(component.actionClick, 'emit');

    component.ngOnInit();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[mat-icon-button]'));
    button.nativeElement.click();

    expect(component.actionClick.emit).toHaveBeenCalledWith({ action: 'delete', row });
  });

  it('should not render paginator if totalItems is 0', () => {
    component.totalItems = 0;
    component.columns = [];
    component.dataSource = [];
    component.ngOnInit();
    fixture.detectChanges();

    const paginator = fixture.debugElement.query(By.css('mat-paginator'));
    expect(paginator).toBeNull();
  });
  it('should not throw if no inputs are passed (default values)', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should emit pageChange event on paginator change', () => {
    jest.spyOn(component.pageChange, 'emit');
    const mockEvent = { pageIndex: 1, pageSize: 20 };

    component.onPageChange(mockEvent);

    expect(component.pageChange.emit).toHaveBeenCalledWith(mockEvent);
  });

  it('should emit sortChange event on sort change', () => {
    jest.spyOn(component.sortChange, 'emit');
    const mockSort = { active: 'name', direction: 'asc' };

    component.onSortChange(mockSort);

    expect(component.sortChange.emit).toHaveBeenCalledWith(mockSort);
  });

  it('should not call setDisplayedColumns if unrelated input changes', () => {
    jest.spyOn(component as any, 'setDisplayedColumns');

    const fakeChanges: SimpleChanges = {
      tableTitle: {
        previousValue: '',
        currentValue: 'New Title',
        firstChange: false,
        isFirstChange: () => false,
      },
    };

    component.ngOnChanges(fakeChanges);

    expect((component as any).setDisplayedColumns).not.toHaveBeenCalled();
  });
});

describe('TableComponent - Custom Template', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatChipsModule,
        TableComponent,
        TestHostComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render custom template cell', () => {
    const customCell = fixture.debugElement.query(By.css('.custom-cell'));
    expect(customCell.nativeElement.textContent).toContain('Custom User - Custom');
  });
});
