// Mock for Chart.js to prevent ESM parsing issues
const ChartMock = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  update: jest.fn(),
  render: jest.fn()
}));

// ✅ Static register method (called by your component at import time)
ChartMock.register = jest.fn();

// ✅ Dummy registerables so spreading won't fail
const registerables = [{}];

module.exports = {
  Chart: ChartMock,
  registerables
};
