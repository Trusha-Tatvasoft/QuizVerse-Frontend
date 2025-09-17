import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartType, registerables, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { adminDashboardChartColors } from '../../../../utils/constants';

Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  imports: [BaseChartDirective],
  templateUrl: './dynamic-chart.component.html',
  styleUrls: ['./dynamic-chart.component.scss'],
})
export class DynamicChartComponent implements OnChanges {
  private _chartData: ChartConfiguration<ChartType>['data'] = {
    labels: [],
    datasets: [],
  };

  @Input()
  set chartData(data: ChartConfiguration<ChartType>['data']) {
    this._chartData = data;
    this.applyThemeIfNeeded();
  }
  get chartData() {
    return this._chartData;
  }

  @Input() chartOptions: ChartConfiguration<ChartType>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  @Input() chartType: ChartType = 'line';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['chartType']) {
      this.applyThemeIfNeeded();
    }
  }

  private applyThemeIfNeeded(): void {
    if (!this._chartData?.datasets?.length) return;

    this._chartData.datasets = this._chartData.datasets.map((dataset) => {
      switch (this.chartType) {
        case 'bar':
          return {
            ...dataset,
            borderColor: adminDashboardChartColors.bar.border,
            backgroundColor: adminDashboardChartColors.bar.fill,
            hoverBackgroundColor: adminDashboardChartColors.bar.fill,
            hoverBorderColor: adminDashboardChartColors.bar.border,
            borderWidth: 2,
            borderRadius: 4,
          };

        case 'doughnut':
          const bgColors =
            dataset.data && dataset.data.length
              ? adminDashboardChartColors.doughnut.fill.slice(0, dataset.data.length)
              : [adminDashboardChartColors.doughnut.fill[0]];
          return {
            ...dataset,
            borderColor: adminDashboardChartColors.doughnut.border,
            backgroundColor: bgColors,
            borderWidth: 2,
          };

        default:
          return dataset; // Leave other chart types untouched
      }
    });
  }
}
