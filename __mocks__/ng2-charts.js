// Mock for ng2-charts to avoid loading its ESM module
module.exports = {
  NgChartsModule: {},
  BaseChartDirective: jest.fn().mockImplementation(() => ({
    chart: {
      update: jest.fn(),
      destroy: jest.fn()
    }
  }))
};
