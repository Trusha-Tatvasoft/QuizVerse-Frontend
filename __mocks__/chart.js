// __mocks__/chart.js
// CommonJS mock used by Jest. Keeps Chart.register(...) safe at import time.

const ChartMock = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  update: jest.fn(),
  render: jest.fn(),
}));

// static register method (no-op)
ChartMock.register = jest.fn();

// For unit tests it's fine to keep registerables empty
const registerables = [];

// placeholders (types stripped at runtime)
const ChartConfiguration = {};
const ChartType = {};

module.exports = {
  Chart: ChartMock,
  registerables,
  ChartConfiguration,
  ChartType,
};
