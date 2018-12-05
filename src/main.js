const debug = require('debug')('main');

const runScrapper = require('./scrapper');
const runAnalytics = require('./analytics');
const runGoogleSearch = require('./google-search');
const config = require('./config');


function main() {
  const task = config.get('task');
  debug(`running: ${task}`);
  switch (task) {
    case 'ANALYTICS':
      return runAnalytics();
    case 'GOOGLE_SEARCH':
      return runGoogleSearch();
    default:
      return runScrapper();
  }
}

main();

