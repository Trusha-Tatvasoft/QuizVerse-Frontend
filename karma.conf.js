/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = function (config) {
    config.set({
      browsers: ['Chrome', 'ChromeHeadless'],
      customLaunchers: {
        ChromeHeadless: {
          base: 'Chrome',
          flags: [
            '--headless',
            '--disable-gpu',
            '--disable-translate',
            '--disable-extensions',
            '--no-sandbox',
            '--remote-debugging-port=9222',
            '--disable-setuid-sandbox',
          ],
        },
      },
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
      ],
    });
  };
  