import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportedQuizlistingComponent } from './reported-quiz-listing.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TableData } from '../../../../../../shared/interfaces/table-component.interface';

describe('ReportedQuizlistingComponent', () => {
  let component: ReportedQuizlistingComponent;
  let fixture: ComponentFixture<ReportedQuizlistingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportedQuizlistingComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportedQuizlistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit pageChange event', () => {
    jest.spyOn(component.pageChange, 'emit');
    const event = { pageIndex: 1, pageSize: 20 };

    component.onPageChange(event);

    expect(component.pageChange.emit).toHaveBeenCalledWith(event);
  });

  it('should emit sortChange event', () => {
    jest.spyOn(component.sortChange, 'emit');
    const event = { active: 'title', direction: 'asc' };

    component.onSortChange(event);

    expect(component.sortChange.emit).toHaveBeenCalledWith(event);
  });

  it('should emit actionClick event', () => {
    jest.spyOn(component.actionClick, 'emit');
    const row: TableData = { id: 1, title: 'Example' } as any;
    const event = { action: 'view', row };

    component.onActionClick(event);

    expect(component.actionClick.emit).toHaveBeenCalledWith(event);
  });
});
