const scrapers = require('./scraper');

async function runScrapper() {
  const promises = scrapers.map(scrape => scrape());
  await Promise.all(promises);
}

module.exports = runScrapper;
