import request from 'request-promise-native';
import { isEmpty, isArray } from 'lodash';

import AristeguiNoticiasScrapper from './aristeguiNoticiasScrapper';
import ElEconomistaScrapper from './eleconomistaScrapper';
import ProcesoScrapper from './procesoScrapper';
import ElUniversal from './eluniversalScrapper';
import constants from '../../constants';


// Utility to scrap websites
export default class ScrapperUtil {

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
        return Promise.all(news.map(item => this.getSource(item.link)))
          .then(results => ElEconomistaScrapper.processImages(news, results))
          .catch(() => news);
      case constants.source.eluniversal.code:
        return Promise.all(news.map(item => this.getSource(item.link)))
          .then(results => ElUniversal.processImages(news, results))
          .catch(() => news);
      case constants.source.aristeguinoticias.code:
        return Promise.all(news.map(item => this.getSource(item.link)))
          .then(results => AristeguiNoticiasScrapper.getArticle(news, results))
          .catch(() => news);
      case constants.source.proceso.code:
        return Promise.all(news.map(item => this.getSource(item.link)))
          .then(results => ProcesoScrapper.getArticle(news, results))
          .catch(() => news);
    }
    return Promise.resolve(news);
  }
}
