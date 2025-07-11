import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { ColumnDef, TableData, ActionIcon } from '../../interfaces/table.interface';
import { By } from '@angular/platform-browser';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  // Mock Inputs
  const mockColumns: ColumnDef[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'status', label: 'Status', type: 'tag' },
  ];

  const mockData: TableData[] = [{ name: 'Alice', status: 'Active' }];

  const mockActions: ActionIcon[] = [
    { icon: 'edit', action: 'edit', tooltip: 'Edit', color: 'blue' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;

    component.columns = mockColumns;
    component.dataSource = mockData;
    component.totalItems = mockData.length;
    component.pageSize = 10;
    component.pageSizeOptions = [5, 10, 20];
    component.actionIcons = mockActions;
    component.applyPaginator = false; // Disable paginator for simplicity
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
