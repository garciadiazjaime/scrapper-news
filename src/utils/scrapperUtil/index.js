import request from 'request-promise-native';
import { isEmpty, isArray } from 'lodash';

import AristeguiNoticiasScrapper from './aristeguiNoticiasScrapper';
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
  // @param {string} source - eg. news name
  // @param {string} htmlString - news source page (html)
  // @return {array|false} - either returns array with news extracted or false
  static extractNews(source, htmlString) {
    if (source === constants.source.aristeguinoticias.id) {
      return AristeguiNoticiasScrapper.extractNews(htmlString);
    }
    return false;
  }

  // post news to api in order to save them
  // @param {string} uri - endpoint to post
  // @param {string} source - eg. news website id
  // @param {array} news
  // @return {promise}
  static postNews(uri, source, news) {
    if (!isEmpty(uri) && source && isArray(news) && news.length) {
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
}
