import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicChartComponent } from './dynamic-chart.component';
import { adminDashboardChartColors } from '../../../../utils/constants';

describe('DynamicChartComponent', () => {
  let component: DynamicChartComponent;
  let fixture: ComponentFixture<DynamicChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicChartComponent);
    component = fixture.componentInstance;

    component.chartData = {
      datasets: [{ data: [1, 2, 3], label: 'Dataset 1' }],
      labels: ['a', 'b', 'c'],
    } as any;

    component.chartOptions = {};
    component.chartType = 'line' as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept chart inputs', () => {
    expect(component.chartData).toBeDefined();
    expect(component.chartType).toBeDefined();
  });

  describe('ngOnChanges', () => {
    it('should call applyThemeIfNeeded when chartData changes', () => {
      const spy = jest.spyOn<any, any>(component, 'applyThemeIfNeeded');
      component.ngOnChanges({
        chartData: {
          currentValue: component.chartData,
          firstChange: true,
          previousValue: null,
          isFirstChange: () => true,
        },
      } as any);
      expect(spy).toHaveBeenCalled();
    });

    it('should call applyThemeIfNeeded when chartType changes', () => {
      const spy = jest.spyOn<any, any>(component, 'applyThemeIfNeeded');
      component.ngOnChanges({
        chartType: {
          currentValue: 'bar',
          firstChange: true,
          previousValue: 'line',
          isFirstChange: () => true,
        },
      } as any);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('applyThemeIfNeeded', () => {
    it('should apply bar chart colors correctly', () => {
      component.chartType = 'bar';
      (component as any).applyThemeIfNeeded();

      const dataset = component.chartData.datasets[0] as any;
      expect(dataset.borderColor).toBe(adminDashboardChartColors.bar.border);
      expect(dataset.backgroundColor).toBe(adminDashboardChartColors.bar.fill);
      expect(dataset.borderWidth).toBe(2);
      expect(dataset.borderRadius).toBe(4);
    });

    it('should apply doughnut chart colors correctly', () => {
      component.chartType = 'doughnut';
      (component as any).applyThemeIfNeeded();

      const dataset = component.chartData.datasets[0] as any;
      expect(dataset.borderColor).toBe(adminDashboardChartColors.doughnut.border);
      expect(dataset.backgroundColor.length).toBe(dataset.data.length);
      expect(dataset.borderWidth).toBe(2);
    });

    it('should not modify datasets for other chart types', () => {
      component.chartType = 'line';
      const originalDataset = { ...component.chartData.datasets[0] } as any;
      (component as any).applyThemeIfNeeded();
      expect(component.chartData.datasets[0]).toEqual(originalDataset);
    });

    it('should return early if no datasets', () => {
      component.chartData.datasets = [];
      expect(() => (component as any).applyThemeIfNeeded()).not.toThrow();
    });
  });
});
