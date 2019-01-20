const aristeguiNoticias = require('./scraper/aristeguiNoticias');

async function runScrapper() {
  await aristeguiNoticias();
}

module.exports = runScrapper;
