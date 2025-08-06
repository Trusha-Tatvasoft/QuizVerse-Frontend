// __mocks__/ng2-charts.js
// Provide an Angular-decorated directive and a module so Angular TestBed accepts them.

const ngCore = require('@angular/core');
const { Directive, Input, NgModule } = ngCore;

//  Mock BaseChartDirective that exposes the inputs your template uses.
// Add any other inputs/outputs your component binds.
 
@Directive({ selector: '[baseChart]' })
class MockBaseChartDirective {
// inputs commonly used by ng2-charts templates — include 'data' and 'type'
  @Input() data;
  @Input() datasets;
  @Input() labels;
  @Input() options;
  @Input() type;
  @Input() chartType;
  @Input() plugins;
  @Input() legend;

  constructor() {
    // minimal fake chart instance so calling `directive.chart.update()` doesn't fail
    this.chart = {
      update: jest.fn ? jest.fn() : () => undefined,
      destroy: jest.fn ? jest.fn() : () => undefined,
    };
  }

  ngOnDestroy() {
    if (this.chart && typeof this.chart.destroy === 'function') {
      this.chart.destroy();
    }
  }
}

@NgModule({
  declarations: [MockBaseChartDirective],
  exports: [MockBaseChartDirective]
})
class MockNgChartsModule {}

module.exports = {
  BaseChartDirective: MockBaseChartDirective,
  NgChartsModule: MockNgChartsModule,
};
