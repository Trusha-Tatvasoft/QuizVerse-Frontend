import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicChartComponent } from './dynamic-chart.component';

describe('DynamicChartComponent', () => {
  let component: DynamicChartComponent;
  let fixture: ComponentFixture<DynamicChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicChartComponent);
    component = fixture.componentInstance;
    if ('chartData' in component) {
      component.chartData = {
        datasets: [{ data: [1, 2, 3], label: 'A' }],
        labels: ['a', 'b', 'c'],
      } as any;
    }
    if ('chartOptions' in component) {
      component.chartOptions = {};
    }
    if ('chartType' in component) {
      component.chartType = 'line' as any;
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept chart inputs', () => {
    // basic sanity: inputs were set without template-binding errors
    expect(component.chartData).toBeDefined();
    expect(component.chartType).toBeDefined();
  });
});
