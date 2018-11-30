const request = require('request-promise-native');
const { isEmpty, isArray } = require('lodash');

const debug = require('debug')('scrapperUtil');

const AristeguiNoticiasScrapper = require('./aristeguiNoticiasScrapper');
const ElEconomistaScrapper = require('./eleconomistaScrapper');
const ProcesoScrapper = require('./procesoScrapper');
const ElUniversal = require('./eluniversalScrapper');
const constants = require('../../constants');


// Utility to scrap websites
class ScrapperUtil {

  // based on url sent function will do a request to get source page
  // @param {string} url
  // @return {promise} Resolves when request succed otherwise rejects
  static getSource(url) {
    if (!isEmpty(url)) {
      return new Promise((resolve, reject) => {
        request(url)
          .then(htmlString => resolve(htmlString))
          .catch(err => reject(err));
      });
    }
    return false;
  };

  // based on source it will call appropiate news extractor
  // @param {string} sourceCode - eg. news name
  // @param {string} htmlString - news source page (html)
  // @return {array|false} - either returns array with news extracted or false
  static extractNews(sourceCode, htmlString) {
    debug(`extracting news for ${sourceCode}...`)
    switch (sourceCode) {
      case constants.source.aristeguinoticias.code:
        return AristeguiNoticiasScrapper.extractNews(htmlString);
      case constants.source.eleconomista.code:
        return ElEconomistaScrapper.extractNews(htmlString);
      case constants.source.proceso.code:
        return ProcesoScrapper.extractNews(htmlString);
      case constants.source.eluniversal.code:
        return ElUniversal.extractNews(htmlString);
    }
    return false;
  }

  // post news to api in order to save them
  // @param {string} uri - endpoint to post
  // @param {array} news
  // @return {promise}
  static postNews(uri, news) {
    if (!isEmpty(uri) && isArray(news) && news.length) {
      const options = {
          method: 'POST',
          uri,
          body: {
            data: news,
          },
          json: true,
      };
      return request(options);
    }
    return false;
  }

  // get images
  // @param {string} sourceCode - html page
  // @param {array} news
  // @return {promise} - news where items are extended if image is found
  static getImages(sourceCode, news) {
    switch (sourceCode) {
      case constants.source.eleconomista.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
          .then(results => ElEconomistaScrapper.processImages(news, results))
          .catch(() => news);
      case constants.source.eluniversal.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
          .then(results => ElUniversal.processImages(news, results))
          .catch(() => news);
      case constants.source.aristeguinoticias.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
          .then(results => AristeguiNoticiasScrapper.getArticle(news, results))
          .catch(() => news);
      case constants.source.proceso.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
          .then(results => ProcesoScrapper.getArticle(news, results))
          .catch(() => news);
    }
    return Promise.resolve(news);
  }

  // get images
  // @param {string} sourceCode - html page
  // @param {array} news
  // @return {promise} - news where items are extended if image is found
  static getArticles(sourceCode, news) {
    debug(`${news.length} articles to get from ${sourceCode}`)
    switch (sourceCode) {
      case constants.source.aristeguinoticias.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
        .then(results => AristeguiNoticiasScrapper.getArticle(news, results))
        .catch(() => news);
      case constants.source.eleconomista.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
          .then(results => ElEconomistaScrapper.getArticle(news, results))
          .catch(() => news);
      case constants.source.eluniversal.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
          .then(results => ElUniversal.getArticle(news, results))
          .catch(() => news);
      case constants.source.proceso.code:
        return Promise.all(news.map(item => this.getSource(item.url)))
          .then(results => ProcesoScrapper.getArticle(news, results))
          .catch(() => news);
    }
    return Promise.resolve(news);
  }
}

module.exports = ScrapperUtil
