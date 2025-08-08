import { Component, Input } from '@angular/core';
import { ChartConfiguration, ChartType, registerables, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  imports: [BaseChartDirective],
  templateUrl: './dynamic-chart.component.html',
  styleUrls: ['./dynamic-chart.component.scss'],
})
export class DynamicChartComponent {
  @Input() chartData: ChartConfiguration<ChartType>['data'] = {
    labels: [],
    datasets: [],
  };

  @Input() chartOptions: ChartConfiguration<ChartType>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  @Input() chartType: ChartType = 'line';
}
