const debug = require('debug')('scrapper');

const constants = require('./constants');
const ScrapperUtil = require('./utils/scrapperUtil');
const config = require('./config');

function runScrapper() {
  const sources = Object.keys(constants.source);

  sources.forEach((source) => {
    const { code, url, status } = constants.source[source];
    if (status) {
      debug(`about to scrap: ${url}`);
      ScrapperUtil.getSource(url)
        .then(response => ScrapperUtil.extractNews(code, response))
        .then(news => ScrapperUtil.getArticles(code, news))
        .then(news => ScrapperUtil.postNews(`${config.get('api.url')}news`, news))
        .then((results) => {
          debug(`successfully scrapped: ${url}`);
          debug(results);
        })
        .catch((error) => {
          debug(`error while scrapping: ${url}`);
          debug(error);
        });
    }
  });
}

module.exports = runScrapper;
